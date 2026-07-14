import json

from fastapi import HTTPException

from app.models.schemas import FlightInput
from app.services import ml_service, groq_service, flight_search_service
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
    "(cheaper, other date/airline). Booking is not available yet. "
    "Valid cities: Delhi, Mumbai, Bangalore, Kolkata, Hyderabad, Chennai. "
    "Valid airlines: AirAsia, Air_India, GO_FIRST, Indigo, SpiceJet, Vistara."
)

# ponytail: in-memory sessions, Supabase agent_sessions in Phase 3
_sessions: dict[str, list] = {}

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


def _estimate_baseline(args: dict) -> dict:
    price = ml_service.predict(_build_input(args))
    return {
        "typical_price_inr": round(price),
        "note": "Historical estimate from ML model, NOT a live bookable price.",
    }


def _explain_price(args: dict) -> dict:
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


def _search_flights(args: dict) -> dict:
    offers = flight_search_service.search(
        args["origin"], args["destination"], args["date"],
        airline=args.get("airline"), flight_class=args.get("flight_class") or "Economy",
    )
    return {"offers": offers, "note": "Live prices (mock inventory), sorted cheapest first."}


_TOOL_FNS = {
    "estimate_baseline": _estimate_baseline,
    "explain_price": _explain_price,
    "search_flights": _search_flights,
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


def _run_tool(name: str, args: dict) -> str:
    try:
        return json.dumps(_TOOL_FNS[name](args))
    except HTTPException as e:
        return json.dumps({"error": e.detail})
    except Exception as e:
        return json.dumps({"error": str(e)})


def chat(session_id: str, message: str) -> str:
    history = _sessions.setdefault(session_id, [])
    history.append({"role": "user", "content": message})
    client = groq_service._get_client()

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
            result = _run_tool(tc.function.name, json.loads(tc.function.arguments))
            history.append({"role": "tool", "tool_call_id": tc.id, "content": result})

    reply = "Sorry, I'm having trouble answering that right now. Could you rephrase?"
    history.append({"role": "assistant", "content": reply})
    return reply
