"""Stage 15: budget dashboard (demo numbers derived from resolved issues)."""
from fastapi import APIRouter
from services.db import db

router = APIRouter()

WARD_BUDGET = 500000  # ₹ per ward (demo)
COST_PER_REPAIR = {"pothole": 8000, "road_crack": 4000, "water_leak": 12000,
                   "drainage": 15000, "streetlight": 3500, "electrical": 6000,
                   "garbage": 1500, "park_maintenance": 5000, "public_property": 7000,
                   "other": 4000}


@router.get("")
def budget():
    with db() as c:
        rows = c.execute(
            """SELECT ward, category,
                 SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) resolved,
                 SUM(CASE WHEN status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) open
               FROM issues WHERE ward IS NOT NULL GROUP BY ward, category""").fetchall()
    by_ward = {}
    for r in rows:
        w = by_ward.setdefault(r["ward"], {"ward": r["ward"], "budget": WARD_BUDGET,
                                            "spent": 0, "open": 0, "resolved": 0})
        cost = COST_PER_REPAIR.get(r["category"] or "other", 4000)
        w["spent"] += cost * (r["resolved"] or 0)
        w["open"] += r["open"] or 0
        w["resolved"] += r["resolved"] or 0
    for w in by_ward.values():
        w["utilization"] = round(100 * w["spent"] / w["budget"], 1)
        w["cost_per_repair"] = round(w["spent"] / w["resolved"], 0) if w["resolved"] else 0
    return list(by_ward.values())
