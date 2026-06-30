"""Google AI Studio (Gemini) wrapper — all AI features go through here."""
import base64
import json
import re
from typing import Optional

import google.generativeai as genai

from config import settings

if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)


CATEGORIES = [
    "pothole", "road_crack", "garbage", "water_leak", "drainage",
    "streetlight", "electrical", "park_maintenance", "public_property", "other",
]

DEPARTMENT_MAP = {
    "pothole": "roads", "road_crack": "roads",
    "water_leak": "water", "drainage": "water",
    "streetlight": "electricity", "electrical": "electricity",
    "garbage": "sanitation", "park_maintenance": "sanitation",
    "public_property": "general", "other": "general",
}


def _extract_json(text: str) -> dict:
    m = re.search(r"\{[\s\S]*\}", text or "")
    if not m: return {}
    try: return json.loads(m.group(0))
    except Exception: return {}


def _vision(): return genai.GenerativeModel(settings.VISION_MODEL)
def _text():   return genai.GenerativeModel(settings.TEXT_MODEL)


def analyze_issue(image_bytes: Optional[bytes], description: str) -> dict:
    """Stage 4: classify + severity + department."""
    if not settings.GOOGLE_API_KEY:
        return {"category": "other", "severity": "medium", "severity_score": 50,
                "title": (description[:60] or "Reported issue"),
                "summary": description or "No description provided.",
                "department": "general",
                "note": "GOOGLE_API_KEY missing — using fallback. Set it in backend/.env."}

    prompt = f"""
    You are an expert Municipal AI.

    Analyze BOTH the image and the citizen description.

    You MUST classify the issue into EXACTLY ONE of these categories.

    Allowed Categories:

    - pothole
    - road_crack
    - garbage
    - water_leak
    - drainage
    - streetlight
    - electrical
    - park_maintenance
    - public_property
    - other

    Classification Rules:

    If dirty drain, sewage, drainage blockage, overflowing drain, stagnant water
    → drainage

    If garbage, trash, waste
    → garbage

    If road hole
    → pothole

    If cracked road
    → road_crack

    If leaking pipe
    → water_leak

    If electric pole, transformer, wire
    → electrical

    If street light
    → streetlight

    If government building, bus stop, bench
    → public_property

    Return ONLY JSON.

    {{
    "category":"drainage",
    "title":"Blocked Drain",
    "summary":"Drainage blockage near school.",
    "severity":"medium",
    "severity_score":60,
    "reasoning":"Drain is blocked.",
    "detected_language":"en"
    }}

    Citizen Description:

    {description}
    """
    parts = [prompt]
    if image_bytes:
        parts.append({"mime_type": "image/jpeg", "data": image_bytes})
    try:
        resp = _vision().generate_content(parts)
        data = _extract_json(resp.text or "")
        print("\n========== GEMINI ==========")
        print(resp.text)
        print("============================")
    except Exception as e:
        data = {"error": str(e)}
        
    if not data or "category" not in data:
        data = {"category": "other", "severity": "medium", "severity_score": 50,
                "title": "Reported issue", "summary": description}
    desc = description.lower()
    if "drain" in desc or "drainage" in desc or "sewage" in desc:
        data["category"] = "drainage"

    elif "garbage" in desc or "dustbin" in desc or "trash" in desc:
        data["category"] = "garbage"

    elif "pothole" in desc:
        data["category"] = "pothole"

    elif "street light" in desc or "streetlight" in desc:
        data["category"] = "streetlight"

    elif "water leak" in desc or "pipe leak" in desc:
        data["category"] = "water_leak"

    elif "electric" in desc or "wire" in desc:
        data["category"] = "electrical"
    data["department"] = DEPARTMENT_MAP.get(data.get("category", "other"), "general")
    print(data)
    return data


def compare_before_after(before_bytes: bytes, after_bytes: bytes) -> dict:
    """Stage 10: verify the contractor actually fixed it."""
    if not settings.GOOGLE_API_KEY:
        return {"resolved": True, "confidence": 0.5, "explanation": "Fallback (no API key)"}
    prompt = """Compare these two photos of the SAME civic issue.
First image = BEFORE (reported problem). Second image = AFTER (claimed fix).
Return STRICT JSON: { "resolved": bool, "confidence": 0-1, "explanation": one sentence }
Be strict — true only if the original problem is clearly gone."""
    try:
         
        resp = _vision().generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": before_bytes},
            {"mime_type": "image/jpeg", "data": after_bytes},
        ])
        return _extract_json(resp.text or "") or {"resolved": False, "confidence": 0.0}
    except Exception as e:
        return {"resolved": False, "confidence": 0.0, "explanation": str(e)}


def predict_recurrence(issue_summary: str, contractor_history: str) -> dict:
    """Stage 11: probability the issue returns in 30/60/90 days."""
    if not settings.GOOGLE_API_KEY:
        return {"d30": 0.15, "d60": 0.30, "d90": 0.45, "reason": "fallback"}
    prompt = f"""Predict the probability (0-1) that this civic issue recurs in 30, 60, 90 days.
Issue: {issue_summary}
Contractor track record: {contractor_history}
Consider: weather, traffic, materials, repair quality.
Return STRICT JSON: {{ "d30": float, "d60": float, "d90": float, "reason": string }}"""
    try:
        resp = _text().generate_content(prompt)
        return _extract_json(resp.text or "") or {"d30": 0.2, "d60": 0.4, "d90": 0.5}
    except Exception:
        return {"d30": 0.2, "d60": 0.4, "d90": 0.5, "reason": "default"}


def predictive_hotspots(historical_summary: str) -> dict:
    """Stage 14: forecast future hotspots."""
    if not settings.GOOGLE_API_KEY:
        return {"hotspots": [
            {"ward": "Ward 4", "issue": "Flooding", "risk": "high", "reason": "Monsoon + history"},
            {"ward": "Ward 7", "issue": "Potholes", "risk": "medium", "reason": "Heavy truck route"},
        ]}
    prompt = f"""Given this civic complaint history, forecast 3-5 hotspots for the next 30 days.
Return STRICT JSON: {{ "hotspots": [{{ "ward": str, "issue": str, "risk":"low|medium|high", "reason": str }}] }}
History: {historical_summary}"""
    try:
        resp = _text().generate_content(prompt)
        return _extract_json(resp.text or "") or {"hotspots": []}
    except Exception:
        return {"hotspots": []}


def transcribe_audio(audio_bytes: bytes, mime: str = "audio/webm") -> dict:
    """Stage 22: voice → text in detected language + English translation."""
    if not settings.GOOGLE_API_KEY:
        return {"transcript": "[voice transcription needs GOOGLE_API_KEY]",
                "english": "", "language": "en"}
    prompt = """Transcribe this voice note. The speaker may use English, Hindi, Telugu,
Tamil, Kannada, or Malayalam. Return STRICT JSON:
{ "transcript": original-language text, "english": English translation,
  "language": ISO code (en/hi/te/ta/kn/ml) }"""
    try:
        resp = _vision().generate_content([
            prompt, {"mime_type": mime, "data": audio_bytes}
        ])
        return _extract_json(resp.text or "") or {"transcript": "", "english": "", "language": "en"}
    except Exception as e:
        return {"transcript": "", "english": "", "language": "en", "error": str(e)}


def assistant_reply(question: str, context: str, lang: str = "en") -> str:
    """Stage 21: Gemini-powered civic assistant."""
    lang_name = {"en": "English", "hi": "Hindi", "te": "Telugu",
                 "ta": "Tamil", "kn": "Kannada", "ml": "Malayalam"}.get(lang, "English")
    if not settings.GOOGLE_API_KEY:
        return "AI assistant offline. Set GOOGLE_API_KEY in backend/.env to enable."
    prompt = f"""You are the Community Hero AI assistant. Answer in {lang_name}.
Be concise (max 4 sentences), helpful, and grounded in the live data below.
If the user asks about their issue's status, use the data; if no data, say so politely.

LIVE DATA:
{context}

USER QUESTION: {question}"""
    try:
        return (_text().generate_content(prompt).text or "").strip()
    except Exception as e:
        return f"Assistant error: {e}"
