from fastapi import APIRouter
from app.models.schemas import FlightInput, ExplainResponse
from app.services import ml_service, groq_service

router = APIRouter()


@router.post("/explain", response_model=ExplainResponse)
def explain(flight: FlightInput):
    price = ml_service.predict(flight)
    importance, base_value = ml_service.explain(flight)
    ai_explanation = groq_service.explain(importance, price)
    return ExplainResponse(
        predicted_price=price,
        feature_importance=importance,
        base_value=base_value,
        ai_explanation=ai_explanation,
    )
