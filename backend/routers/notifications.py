"""Stage 20: simple derived notifications from issue events."""
from fastapi import APIRouter, Depends
from services.db import db
from services.auth import current_user

router = APIRouter()


@router.get("")
def my_notifications(user=Depends(current_user)):
    """Derive notifications from the user's issues + role."""
    out = []
    with db() as c:
        if user["role"] == "citizen":
            rows = c.execute(
                """SELECT id,title,status,resolved_at,created_at FROM issues
                   WHERE reporter_id=? ORDER BY id DESC LIMIT 20""",
                (user["id"],)).fetchall()
            for r in rows:
                if r["status"] == "resolved":
                    out.append({"icon":"✅","title":f"Issue #{r['id']} resolved",
                                "body":r["title"],"when":r["resolved_at"] or r["created_at"]})
                elif r["status"] == "in_progress":
                    out.append({"icon":"🔧","title":f"Repair started on #{r['id']}",
                                "body":r["title"],"when":r["created_at"]})
                elif r["status"] == "assigned":
                    out.append({"icon":"📌","title":f"Contractor assigned #{r['id']}",
                                "body":r["title"],"when":r["created_at"]})
                elif r["status"] == "verified":
                    out.append({"icon":"👍","title":f"Community verified #{r['id']}",
                                "body":r["title"],"when":r["created_at"]})
                elif r["status"] == "rejected":
                    out.append({"icon":"❌","title":f"Resolution rejected on #{r['id']}",
                                "body":"Contractor must redo the repair.","when":r["created_at"]})
        elif user["role"] == "contractor":
            rows = c.execute(
                """SELECT id,title,severity,created_at FROM issues
                   WHERE assigned_contractor_id=? AND status IN ('assigned','in_progress')
                   ORDER BY id DESC LIMIT 20""",(user["id"],)).fetchall()
            for r in rows:
                out.append({"icon":"🛠️","title":f"Job #{r['id']} ({r['severity']})",
                            "body":r["title"],"when":r["created_at"]})
        else:  # authority
            rows = c.execute(
                """SELECT id,title,severity,ward,created_at FROM issues
                   WHERE severity IN ('high','critical') AND status NOT IN ('resolved','rejected')
                   ORDER BY id DESC LIMIT 20""").fetchall()
            for r in rows:
                out.append({"icon":"🚨","title":f"{r['severity'].upper()} in {r['ward'] or 'unknown'}",
                            "body":r["title"],"when":r["created_at"]})
    return out
