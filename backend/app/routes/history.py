from fastapi import APIRouter
from app.services import supabase_service

router = APIRouter()


@router.get("/history")
def history():
    return supabase_service.get_history(limit=20)
