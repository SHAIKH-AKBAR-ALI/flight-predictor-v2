"""Mock live flight inventory.

ponytail: deterministic generator instead of a real flight API — Amadeus test
API has no usable Indian domestic data and we have no credentials. Interface
matches what a real API wrapper would expose: search(...) -> list of offers.
Swap the body for an Amadeus/other client when one becomes available.
"""
import os
import random
from datetime import date as date_cls
from pathlib import Path

import pandas as pd

from app.models.schemas import FlightInput
from app.services import ml_service, supabase_service

_AIRLINE_CODES = {
    "AirAsia": "I5",
    "Air_India": "AI",
    "GO_FIRST": "G8",
    "Indigo": "6E",
    "SpiceJet": "SG",
    "Vistara": "UK",
}
_TIMES = ["Early_Morning", "Morning", "Afternoon", "Evening", "Night"]

_route_medians = None


def get_route_median(origin: str, destination: str) -> float:
    global _route_medians
    if _route_medians is None:
        csv_path = Path(os.getenv("MODEL_PATH", "../data/model_artifacts_v2.pkl")).parent / "Indian Airlines.csv"
        df = pd.read_csv(csv_path, usecols=["source_city", "destination_city", "duration"])
        _route_medians = df.groupby(["source_city", "destination_city"])["duration"].median()
    try:
        return float(_route_medians[(origin, destination)])
    except KeyError:
        return 2.0


def search(origin: str, destination: str, travel_date: str,
           airline: str | None = None, flight_class: str = "Economy") -> list[dict]:
    """Return mock live offers sorted by price. Logs every quote to live_quotes."""
    days_left = max(1, min((date_cls.fromisoformat(travel_date) - date_cls.today()).days, 49))
    rng = random.Random(f"{origin}|{destination}|{travel_date}|{flight_class}")
    duration = get_route_median(origin, destination)

    offers = []
    for name, code in _AIRLINE_CODES.items():
        for _ in range(rng.randint(0, 2)):
            dep = rng.choice(_TIMES)
            stops = rng.choice(["zero", "zero", "one"])
            base = ml_service.predict(FlightInput(
                airline=name,
                source_city=origin,
                departure_time=dep,
                stops=stops,
                arrival_time="Evening",
                destination_city=destination,
                flight_class=flight_class,
                duration=duration + (0.0 if stops == "zero" else rng.uniform(0.5, 2.0)),
                days_left=days_left,
            ))
            offers.append({
                "flight_id": f"{code}-{rng.randint(100, 999)}",
                "airline": name,
                "origin": origin,
                "destination": destination,
                "date": travel_date,
                "departure_time": dep,
                "stops": stops,
                "flight_class": flight_class,
                "duration_hours": round(duration + (0.0 if stops == "zero" else 1.0), 1),
                "price_inr": round(base * rng.uniform(0.85, 1.25)),
                "seats_left": rng.randint(1, 9),
            })

    if airline:
        offers = [o for o in offers if o["airline"].lower() == airline.lower()]
    offers.sort(key=lambda o: o["price_inr"])

    try:
        supabase_service.get_client().table("live_quotes").insert([
            {k: o[k] for k in ("flight_id", "airline", "origin", "destination",
                               "date", "flight_class", "price_inr")}
            for o in offers
        ]).execute()
    except Exception:
        pass  # ponytail: quote logging is telemetry, never fail the search on it

    return offers
