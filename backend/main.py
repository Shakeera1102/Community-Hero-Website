"""FastAPI entry point for Community Hero AI."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routers import contractors
from config import settings
from services.db import init_db
from routers import (auth, issues, ai, community, dashboard, gamification,
                     assistant, notifications, budget)

from routers import maintenance

app = FastAPI(title="Community Hero AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"name": "Community Hero AI", "status": "ok", "docs": "/docs",
            "version": "2.0.0"}


app.include_router(auth.router,          prefix="/api/auth",          tags=["auth"])
app.include_router(issues.router,        prefix="/api/issues",        tags=["issues"])
app.include_router(ai.router,            prefix="/api/ai",            tags=["ai"])
app.include_router(community.router,     prefix="/api/community",     tags=["community"])
app.include_router(dashboard.router,     prefix="/api/dashboard",     tags=["dashboard"])

app.include_router(
    contractors.router,
    prefix="/api/contractors",
    tags=["Contractors"],
)

app.include_router(gamification.router,  prefix="/api/gamification",  tags=["gamification"])
app.include_router(assistant.router,     prefix="/api/assistant",     tags=["assistant"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(budget.router,        prefix="/api/budget",        tags=["budget"])

app.include_router(
    maintenance.router,
    prefix="/api/maintenance",
    tags=["Maintenance"]
)


