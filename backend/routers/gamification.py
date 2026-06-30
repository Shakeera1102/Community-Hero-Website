from fastapi import APIRouter
from services.db import db

router = APIRouter()


@router.get("/leaderboard")
def leaderboard():
    with db() as c:
        rows = c.execute(
            "SELECT id, name, ward, points FROM users ORDER BY points DESC LIMIT 50"
        ).fetchall()
    out = []
    for i, r in enumerate(rows, 1):
        pts = r["points"]
        badge = "🏆 Hero" if pts >= 200 else "⭐ Champion" if pts >= 100 else "🌱 Citizen"
        out.append({**dict(r), "rank": i, "badge": badge})
    return out
