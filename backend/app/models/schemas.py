from pydantic import BaseModel, Field, ConfigDict


class FlightInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    airline: str
    source_city: str
    departure_time: str
    stops: str
    arrival_time: str
    destination_city: str
    flight_class: str = Field(..., alias="class")
    duration: float
    days_left: int


class PredictionResponse(BaseModel):
    predicted_price: float
    currency: str = "INR"


class ExplainResponse(BaseModel):
    predicted_price: float
    currency: str = "INR"
    feature_importance: dict[str, float]
    base_value: float
    ai_explanation: str
