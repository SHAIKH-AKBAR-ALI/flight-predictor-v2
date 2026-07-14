from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services import agent_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply = agent_service.chat(req.session_id, req.message)
    return ChatResponse(session_id=req.session_id, reply=reply)
