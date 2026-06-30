"""AI Assistant + voice transcription endpoints (Stages 21, 22)."""
from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import Optional
from services.gemini import assistant_reply, transcribe_audio
from services.db import db
from services.auth import current_user

router = APIRouter()


@router.post("/chat")
def chat(question: str = Form(...), lang: str = Form("en"),
         user=Depends(current_user)):
    with db() as c:
        mine = c.execute(
            "SELECT id,title,status,severity,ward FROM issues WHERE reporter_id=? ORDER BY id DESC LIMIT 10",
            (user["id"],)).fetchall()
        ward_open = c.execute(
            "SELECT COUNT(*) c FROM issues WHERE ward=? AND status NOT IN ('resolved','rejected')",
            (user.get("ward"),)).fetchone()
    ctx = (f"User: {user['name']} ({user['role']}), ward={user.get('ward')}, points={user['points']}.\n"
           f"Their recent issues: {[dict(r) for r in mine]}\n"
           f"Open issues in their ward: {ward_open['c'] if ward_open else 0}")
    return {"reply": assistant_reply(question, ctx, lang)}


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    data = await audio.read()
    mime = audio.content_type or "audio/webm"
    return transcribe_audio(data, mime)
