import json
from uuid import uuid4

from fastapi import HTTPException

from app.models.schemas import FlightInput
from app.services import ml_service, groq_service, flight_search_service, supabase_service
from app.services.flight_search_service import get_route_median as _get_route_median

MODEL = "llama-3.3-70b-versatile"
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
    "Booking flow: after the user picks a flight, call book_flight with its "
    "flight_id, then collect passenger name and email, then show the booking "
    "summary and ask the user to confirm. Only call book_flight with confirm=true "
    "after the user has explicitly confirmed in their own message. A booking is "
    "confirmed ONLY when book_flight returns status=confirmed with a "
    "confirmation_id — always tell the user that ID. If the tool says "
    "awaiting_confirmation or NOT completed, the booking did NOT happen; never "
    "claim it did. "
    "Valid cities: Delhi, Mumbai, Bangalore, Kolkata, Hyderabad, Chennai. "
    "Valid airlines: AirAsia, Air_India, GO_FIRST, Indigo, SpiceJet, Vistara."
)

_EMPTY_STATE = {"messages": [], "last_offers": [], "booking": None}


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
    offers = flight_search_service.search(
        args["origin"], args["destination"], args["date"],
        airline=args.get("airline"), flight_class=args.get("flight_class") or "Economy",
    )
    state["last_offers"] = offers
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
            state["booking"] = {"stage": "confirmed", "confirmation_id": confirmation_id}
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


_TOOL_FNS = {
    "estimate_baseline": _estimate_baseline,
    "explain_price": _explain_price,
    "search_flights": _search_flights,
    "book_flight": _book_flight,
}

_FLIGHT_PARAMS = {
    "type": "object",
    "properties": {
        "origin": {"type": "string", "description": "Source city"},
        "destination": {"type": "string", "description": "Destination city"},
        "airline": {"type": "string", "description": "Optional airline filter"},
        "flight_class": {"type": "string", "enum": ["Economy", "Business"]},
        "stops": {"type": "string", "enum": ["zero", "one", "two_or_more"]},
        "days_left": {"type": "integer", "description": "Days until departure"},
        "departure_time": {
            "type": "string",
            "enum": ["Early_Morning", "Morning", "Afternoon", "Evening", "Night", "Late_Night"],
        },
    },
    "required": ["origin", "destination"],
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_flights",
            "description": "Search live flight offers for a route and date. Returns bookable options sorted by price.",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {"type": "string", "description": "Source city"},
                    "destination": {"type": "string", "description": "Destination city"},
                    "date": {"type": "string", "description": "Travel date, YYYY-MM-DD"},
                    "airline": {"type": "string", "description": "Optional airline filter"},
                    "flight_class": {"type": "string", "enum": ["Economy", "Business"]},
                },
                "required": ["origin", "destination", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "book_flight",
            "description": (
                "Book a flight from the latest search results. Multi-step: pass flight_id to select, "
                "then passenger_name + passenger_email, then confirm=true ONLY after the user explicitly confirmed."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {"type": "string", "description": "flight_id from search_flights results"},
                    "passenger_name": {"type": "string"},
                    "passenger_email": {"type": "string"},
                    "confirm": {"type": "boolean", "description": "true only after explicit user confirmation"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_baseline",
            "description": "Get the typical/historical price for a route from the ML model. Not a live price.",
            "parameters": _FLIGHT_PARAMS,
        },
    },
    {
        "type": "function",
        "function": {
            "name": "explain_price",
            "description": "Explain WHY a route typically costs what it does (SHAP factors + plain-English explanation).",
            "parameters": _FLIGHT_PARAMS,
        },
    },
]


def _run_tool(name: str, args: dict, state: dict) -> str:
    try:
        return json.dumps(_TOOL_FNS[name](args, state))
    except HTTPException as e:
        return json.dumps({"error": e.detail})
    except Exception as e:
        return json.dumps({"error": str(e)})


def chat(session_id: str, message: str) -> str:
    state = _load_session(session_id)
    history = state["messages"]
    history.append({"role": "user", "content": message})
    client = groq_service._get_client()

    try:
        for _ in range(MAX_TOOL_ITERATIONS):
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "system", "content": SYSTEM_PROMPT}] + history,
                tools=TOOLS,
                temperature=0.3,
            )
            msg = response.choices[0].message
            if not msg.tool_calls:
                history.append({"role": "assistant", "content": msg.content})
                return msg.content
            history.append(
                {
                    "role": "assistant",
                    "content": msg.content,
                    "tool_calls": [tc.model_dump() for tc in msg.tool_calls],
                }
            )
            for tc in msg.tool_calls:
                result = _run_tool(tc.function.name, json.loads(tc.function.arguments), state)
                history.append({"role": "tool", "tool_call_id": tc.id, "content": result})

        reply = "Sorry, I'm having trouble answering that right now. Could you rephrase?"
        history.append({"role": "assistant", "content": reply})
        return reply
    finally:
        _save_session(session_id, state)
