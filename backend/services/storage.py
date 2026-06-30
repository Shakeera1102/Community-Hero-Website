"""Save uploaded files to local disk. Swap for S3/GCS in production."""
import os
import uuid
from fastapi import UploadFile
from config import settings


async def save_upload(file: UploadFile) -> tuple[str, bytes]:
    """Save file, return (public_url, raw_bytes)."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, name)
    data = await file.read()
    with open(path, "wb") as f:
        f.write(data)
    return f"/uploads/{name}", data
