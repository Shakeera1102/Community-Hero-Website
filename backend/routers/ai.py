"""Standalone AI utility endpoints."""
from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from services.gemini import analyze_issue

router = APIRouter()


@router.post("/analyze")
async def analyze(description: str = Form(""), image: Optional[UploadFile] = File(None)):
    """Preview-only classify + severity, without saving an issue."""
    image_bytes = await image.read() if image else None
    return analyze_issue(image_bytes, description)
