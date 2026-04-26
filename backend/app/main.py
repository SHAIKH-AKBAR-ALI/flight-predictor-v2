from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.services import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_service.load_artifacts()
    yield


app = FastAPI(title="Flight Price Predictor", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import predict, explain, health, history

app.include_router(health.router)
app.include_router(predict.router)
app.include_router(explain.router)
app.include_router(history.router)
