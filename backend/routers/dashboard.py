"""Stages 6 + 8: accountability + predictive insights."""
from fastapi import APIRouter
from services.db import db
from services.gemini import predictive_hotspots

router = APIRouter()


@router.get("/wards")
def ward_scores():
    """Health score per ward: 100 - (open critical *5) - (open total) + resolved*0.5."""
    with db() as c:
        rows = c.execute("""
            SELECT ward,
              SUM(CASE WHEN status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) AS open_count,
              SUM(CASE WHEN severity='critical' AND status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) AS critical_open,
              SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) AS resolved_count,
              COUNT(*) AS total
            FROM issues WHERE ward IS NOT NULL GROUP BY ward
        """).fetchall()
    out = []
    for r in rows:
        score = max(0, min(100, 100 - r["critical_open"]*5 - r["open_count"] + r["resolved_count"]*0.5))
        out.append({**dict(r), "health_score": round(score, 1)})
    out.sort(key=lambda x: x["health_score"], reverse=True)
    return out


@router.get("/contractors")
def contractors():
    """Accountability score per contractor."""
    with db() as c:
        rows = c.execute("""
            SELECT u.id, u.name,
              COUNT(i.id) AS assigned,
              SUM(CASE WHEN i.status='resolved' THEN 1 ELSE 0 END) AS resolved,
              AVG(i.recurrence_risk) AS avg_recurrence
            FROM users u LEFT JOIN issues i ON i.assigned_contractor_id=u.id
            WHERE u.role='contractor' GROUP BY u.id
        """).fetchall()
    out = []
    for r in rows:
        a, res = r["assigned"] or 0, r["resolved"] or 0
        rate = (res / a) if a else 0
        risk = r["avg_recurrence"] or 0
        score = max(0, min(100, rate * 100 - risk * 30))
        out.append({**dict(r), "resolution_rate": round(rate*100, 1),
                    "accountability_score": round(score, 1)})
    return out


@router.get("/predictions")
def predictions():
    with db() as c:
        rows = c.execute("""SELECT category, ward, COUNT(*) c FROM issues
            GROUP BY category, ward ORDER BY c DESC LIMIT 20""").fetchall()
    summary = "; ".join(f"{r['c']}x {r['category']} in {r['ward']}" for r in rows) or "no data"
    return predictive_hotspots(summary)


@router.get("/stats")
def stats():
    with db() as c:
        totals = c.execute("""SELECT
            COUNT(*) total,
            SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) resolved,
            SUM(CASE WHEN severity='critical' AND status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) critical_open
            FROM issues""").fetchone()
        by_cat = c.execute("""SELECT category, COUNT(*) c FROM issues
            GROUP BY category ORDER BY c DESC""").fetchall()
    return {"totals": dict(totals), "by_category": [dict(r) for r in by_cat]}
