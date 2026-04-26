import os
from supabase import create_client


def get_client():
    return create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


def log_prediction(flight_data: dict, predicted_price: float):
    client = get_client()
    client.table("predictions").insert(
        {**flight_data, "predicted_price": predicted_price}
    ).execute()


def log_explanation(flight_data: dict, predicted_price: float, shap_values: dict, ai_explanation: str):
    client = get_client()
    client.table("predictions").insert(
        {
            **flight_data,
            "predicted_price": predicted_price,
            "shap_values": shap_values,
            "ai_explanation": ai_explanation,
        }
    ).execute()


def get_history(limit: int = 20) -> list:
    client = get_client()
    result = (
        client.table("predictions")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data
