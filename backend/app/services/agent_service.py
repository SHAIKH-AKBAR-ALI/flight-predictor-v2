import json
import os
from contextvars import ContextVar
from typing import Literal, Optional
from uuid import uuid4

from fastapi import HTTPException
from groq import BadRequestError, RateLimitError
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.errors import GraphRecursionError
from langgraph.prebuilt import create_react_agent

from app.models.schemas import FlightInput
from app.services import ml_service, groq_service, flight_search_service, supabase_service
from app.services.flight_search_service import get_route_median as _get_route_median

# ponytail: separate model from explain-flow's llama-3.3 so the agent has its own
# Groq daily token quota; also a stronger tool-caller
MODEL = "openai/gpt-oss-120b"
MAX_TOOL_ITERATIONS = 5

SYSTEM_PROMPT = (
    "You are a flight assistant for Indian domestic flights. First collect origin, "
    "destination, and travel date — ask for whatever is missing before searching. "
    "Treat any mentioned airline, class, or time preference as search filters. "
    "Use search_flights for live options and present them sorted by price; when "
    "you also have a historical baseline (estimate_baseline), note whether live "
    "prices are above or below typical for the route. Baseline estimates are "
    "historical, never bookable prices. Refine searches based on user feedback "
    "(cheaper, other date/airline). "
    "Booking flow: the moment the user picks a flight, IMMEDIATELY call "
    "book_flight with its flight_id in that same turn — never just ask for "
    "details without calling it first. Then collect passenger name and email, "
    "then show the booking "
    "summary and ask the user to confirm. Only call book_flight with confirm=true "
    "after the user has explicitly confirmed in their own message. A booking is "
    "confirmed ONLY when book_flight returns status=confirmed with a "
    "confirmation_id — always tell the user that ID. If the tool says "
    "awaiting_confirmation or NOT completed, the booking did NOT happen; never "
    "claim it did. "
    "Reply in short plain text — no markdown tables or headers; the UI already "
    "shows flight options as cards, so summarize rather than list every option. "
    "Valid cities: Delhi, Mumbai, Bangalore, Kolkata, Hyderabad, Chennai. "
    "Valid airlines: AirAsia, Air_India, GO_FIRST, Indigo, SpiceJet, Vistara."
)

_EMPTY_STATE = {"messages": [], "last_offers": [], "booking": None}

# Session state for the current request — set in chat(), read by tools.
# ContextVar keeps module-level @tool functions per-request safe.
_STATE: ContextVar[dict] = ContextVar("agent_session_state")


def _load_session(session_id: str) -> dict:
    rows = (
        supabase_service.get_client()
        .table("agent_sessions")
        .select("state")
        .eq("session_id", session_id)
        .execute()
        .data
    )
    return rows[0]["state"] if rows else json.loads(json.dumps(_EMPTY_STATE))


def _save_session(session_id: str, state: dict) -> None:
    supabase_service.get_client().table("agent_sessions").upsert(
        {"session_id": session_id, "state": state, "updated_at": "now()"}
    ).execute()


def _build_input(args: dict) -> FlightInput:
    origin = args["origin"]
    destination = args["destination"]
    return FlightInput(
        airline=args.get("airline") or "Indigo",
        source_city=origin,
        departure_time=args.get("departure_time") or "Morning",
        stops=args.get("stops") or "one",
        arrival_time="Evening",
        destination_city=destination,
        flight_class=args.get("flight_class") or "Economy",
        duration=_get_route_median(origin, destination),
        days_left=args.get("days_left") or 15,
    )


def _estimate_baseline(args: dict, state: dict) -> dict:
    price = ml_service.predict(_build_input(args))
    return {
        "typical_price_inr": round(price),
        "note": "Historical estimate from ML model, NOT a live bookable price.",
    }


def _explain_price(args: dict, state: dict) -> dict:
    flight = _build_input(args)
    price = ml_service.predict(flight)
    importance, _ = ml_service.explain(flight)
    explanation = groq_service.explain(importance, price)
    top = sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    return {
        "typical_price_inr": round(price),
        "top_factors": {k: round(v) for k, v in top},
        "explanation": explanation,
        "note": "Historical estimate from ML model, NOT a live bookable price.",
    }


def _search_flights(args: dict, state: dict) -> dict:
    # new search = new journey — drop a finished (or abandoned) booking so its
    # confirmation doesn't keep rendering in the UI
    state["booking"] = None
    offers = flight_search_service.search(
        args["origin"], args["destination"], args["date"],
        airline=args.get("airline"), flight_class=args.get("flight_class") or "Economy",
    )
    # model may search multiple dates/routes in one turn — accumulate so every
    # offer it presents is selectable via book_flight
    searches = state.get("_turn_searches", 0)
    state["last_offers"] = offers if searches == 0 else state["last_offers"] + offers
    state["_turn_searches"] = searches + 1
    return {"offers": offers, "note": "Live prices (mock inventory), sorted cheapest first."}


def _book_flight(args: dict, state: dict) -> dict:
    booking = state.get("booking") or {}

    # (re)select only when a different flight is named — model habitually re-sends
    # flight_id on every call, and resetting would wipe the confirmation gate window
    if args.get("flight_id") and args["flight_id"] != (booking.get("offer") or {}).get("flight_id"):
        offer = next(
            (o for o in state.get("last_offers", []) if o["flight_id"] == args["flight_id"]),
            None,
        )
        if offer is None:
            return {"error": f"Unknown flight_id {args['flight_id']}. Run search_flights first and pick from its results."}
        booking = {"stage": "selected", "offer": offer}

    if not booking.get("stage"):
        return {"error": "No flight selected. Call book_flight with a flight_id from search results."}
    if booking["stage"] == "confirmed":
        return {"status": "confirmed", "confirmation_id": booking["confirmation_id"],
                "note": "This booking is already confirmed."}

    if args.get("passenger_name") and args.get("passenger_email"):
        booking["passenger"] = {"name": args["passenger_name"], "email": args["passenger_email"]}
        if booking["stage"] != "ready":  # keep original gate window if model re-sends details
            booking["stage"] = "ready"
            booking["ready_at_msg"] = len(state["messages"])

    if booking["stage"] == "selected":
        state["booking"] = booking
        return {"status": "need_passenger_details", "offer": booking["offer"],
                "note": "Ask the user for passenger name and email."}

    summary = {**booking["offer"], "passenger": booking["passenger"]}

    if args.get("confirm"):
        state["booking"] = booking
        # Booking gate: user must have sent a message AFTER the summary was ready —
        # the model cannot collect details and confirm in the same turn.
        confirmed_by_user = any(
            m.get("role") == "user" for m in state["messages"][booking["ready_at_msg"]:]
        )
        if confirmed_by_user:
            confirmation_id = "FL" + uuid4().hex[:8].upper()
            supabase_service.get_client().table("bookings").insert({
                "confirmation_id": confirmation_id,
                "flight_id": booking["offer"]["flight_id"],
                "airline": booking["offer"]["airline"],
                "origin": booking["offer"]["origin"],
                "destination": booking["offer"]["destination"],
                "date": booking["offer"]["date"],
                "flight_class": booking["offer"]["flight_class"],
                "price_inr": booking["offer"]["price_inr"],
                "passenger_name": booking["passenger"]["name"],
                "passenger_email": booking["passenger"]["email"],
            }).execute()
            # keep offer + passenger so the UI can render the ticket
            state["booking"] = {"stage": "confirmed", "confirmation_id": confirmation_id,
                                "offer": booking["offer"], "passenger": booking["passenger"]}
            return {"status": "confirmed", "confirmation_id": confirmation_id,
                    "payment": "mock payment successful", "booking": summary}
        return {"status": "awaiting_confirmation", "summary": summary,
                "note": "Confirmation must come from the USER, in a message sent after "
                        "seeing this summary. Do NOT call book_flight again this turn — "
                        "show the summary and ask the user to confirm."}

    state["booking"] = booking
    return {"status": "awaiting_confirmation", "summary": summary,
            "note": "Booking NOT completed yet — no confirmation ID exists. Show this "
                    "summary and ask the user to explicitly confirm before booking."}


def _run_tool(fn, args: dict) -> str:
    try:
        return json.dumps(fn(args, _STATE.get()))
    except HTTPException as e:
        return json.dumps({"error": e.detail})
    except Exception as e:
        return json.dumps({"error": str(e)})


# --- LangGraph tools: thin typed wrappers over the implementations above ---

_DepartureTime = Literal["Early_Morning", "Morning", "Afternoon", "Evening", "Night", "Late_Night"]


@tool
def search_flights(origin: str, destination: str, date: str,
                   airline: Optional[str] = None,
                   flight_class: Optional[Literal["Economy", "Business"]] = None) -> str:
    """Search live flight offers for a route and date (YYYY-MM-DD). Returns bookable options sorted by price."""
    return _run_tool(_search_flights, {"origin": origin, "destination": destination, "date": date,
                                       "airline": airline, "flight_class": flight_class})


@tool
def book_flight(flight_id: Optional[str] = None,
                passenger_name: Optional[str] = None,
                passenger_email: Optional[str] = None,
                confirm: bool = False) -> str:
    """Book a flight from the latest search results. Multi-step: pass flight_id to select,
    then passenger_name + passenger_email, then confirm=true ONLY after the user explicitly confirmed."""
    return _run_tool(_book_flight, {"flight_id": flight_id, "passenger_name": passenger_name,
                                    "passenger_email": passenger_email, "confirm": confirm})


@tool
def estimate_baseline(origin: str, destination: str,
                      airline: Optional[str] = None,
                      flight_class: Optional[Literal["Economy", "Business"]] = None,
                      stops: Optional[Literal["zero", "one", "two_or_more"]] = None,
                      days_left: Optional[int] = None,
                      departure_time: Optional[_DepartureTime] = None) -> str:
    """Get the typical/historical price for a route from the ML model. Not a live price."""
    return _run_tool(_estimate_baseline, {"origin": origin, "destination": destination, "airline": airline,
                                          "flight_class": flight_class, "stops": stops,
                                          "days_left": days_left, "departure_time": departure_time})


@tool
def explain_price(origin: str, destination: str,
                  airline: Optional[str] = None,
                  flight_class: Optional[Literal["Economy", "Business"]] = None,
                  stops: Optional[Literal["zero", "one", "two_or_more"]] = None,
                  days_left: Optional[int] = None,
                  departure_time: Optional[_DepartureTime] = None) -> str:
    """Explain WHY a route typically costs what it does (SHAP factors + plain-English explanation)."""
    return _run_tool(_explain_price, {"origin": origin, "destination": destination, "airline": airline,
                                      "flight_class": flight_class, "stops": stops,
                                      "days_left": days_left, "departure_time": departure_time})


# Primary key first; fall back to the other account when its quota is exhausted.
_KEY_ENVS = ("GROQ_API_KEY_2", "GROQ_API_KEY")
_graphs = {}


def _get_graph(key_env: str):
    if key_env not in _graphs:
        # LangSmith tracing: just set LANGSMITH_TRACING=true + LANGSMITH_API_KEY in .env
        _graphs[key_env] = create_react_agent(
            ChatGroq(model=MODEL, temperature=0.3, max_retries=5, api_key=os.getenv(key_env)),
            [search_flights, book_flight, estimate_baseline, explain_price],
            prompt=SYSTEM_PROMPT,
        )
    return _graphs[key_env]


def _invoke(history: list[dict]) -> str:
    rate_limited = None
    for key_env in _KEY_ENVS:
        if not os.getenv(key_env):
            continue
        for attempt in (1, 2):
            try:
                result = _get_graph(key_env).invoke(
                    {"messages": history},
                    # each tool round = 2 graph steps (agent → tools)
                    config={"recursion_limit": 2 * MAX_TOOL_ITERATIONS + 1},
                )
                content = result["messages"][-1].content
                if isinstance(content, list):  # content-blocks form
                    content = "".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in content)
                return content
            except GraphRecursionError:
                return "Sorry, I'm having trouble answering that right now. Could you rephrase?"
            except RateLimitError as e:
                rate_limited = e
                break  # this account's quota is done — try the next key
            except BadRequestError as e:
                # model occasionally emits malformed tool-call JSON (Groq 400
                # tool_use_failed) — retry the turn once, then degrade gracefully
                if "tool_use_failed" in str(e):
                    if attempt == 1:
                        continue
                    return "Sorry, something went wrong on my side. Please try that again."
                raise
    raise rate_limited  # both accounts exhausted → route turns this into a 503


def _response(state: dict, reply: str, searched: bool) -> dict:
    # Only surface offers on the turn that ran a search — otherwise stale
    # cards re-render after select/booking turns.
    return {
        "reply": reply,
        "offers": state.get("last_offers", []) if searched else [],
        "booking": state.get("booking"),
    }


def chat(session_id: str, message: str) -> dict:
    state = _load_session(session_id)
    # Persist only user/assistant text turns (tool transcripts stay within a
    # single graph run); also strips legacy sessions' raw tool messages.
    state["messages"] = [
        m for m in state["messages"]
        if m.get("role") in ("user", "assistant")
        and isinstance(m.get("content"), str) and m["content"]
        and not m.get("tool_calls")
    ]
    offers_before = state.get("last_offers")  # search replaces the list, so identity change = searched
    state["_turn_searches"] = 0
    history = state["messages"]
    history.append({"role": "user", "content": message})

    token = _STATE.set(state)
    try:
        reply = _invoke(history)
        history.append({"role": "assistant", "content": reply})
        return _response(state, reply, state.get("last_offers") is not offers_before)
    finally:
        _STATE.reset(token)
        _save_session(session_id, state)
