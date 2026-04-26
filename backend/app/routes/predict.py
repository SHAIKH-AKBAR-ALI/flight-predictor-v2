from fastapi import APIRouter
from app.models.schemas import FlightInput, PredictionResponse
from app.services import ml_service, supabase_service

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict(flight: FlightInput):
    price = ml_service.predict(flight)
    supabase_service.log_prediction(flight.model_dump(by_alias=True), price)
    return PredictionResponse(predicted_price=price)
