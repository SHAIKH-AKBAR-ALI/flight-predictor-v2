from fastapi import APIRouter, HTTPException
from groq import RateLimitError
from app.models.schemas import ChatRequest, ChatResponse
from app.services import agent_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        result = agent_service.chat(req.session_id, req.message)
    except RateLimitError:
        raise HTTPException(503, "The assistant hit its daily usage limit. Try again later.")
    return ChatResponse(session_id=req.session_id, **result)
