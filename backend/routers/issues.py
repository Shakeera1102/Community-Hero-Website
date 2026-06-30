"""Stage 1 + 4 + 5: create, list, route, resolve."""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional

from services.db import db
from services.auth import current_user, require_authority
from services.storage import save_upload
from services.gemini import analyze_issue, compare_before_after, predict_recurrence

router = APIRouter()


@router.post("")
async def create_issue(
    description: str = Form(""),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    ward: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user=Depends(current_user),
):
    """Stage 1: report. Stage 2: AI analyzes. Stage 4: auto-route to dept.
    Also runs duplicate detection on nearby issues (geo + category)."""
    image_url, image_bytes = (None, None)
    if image:
        image_url, image_bytes = await save_upload(image)

    ai = analyze_issue(image_bytes, description)

    # Stage 2: duplicate detection — same category, nearby (~150m)
    duplicate_of = None
    if lat is not None and lng is not None:
        with db() as c:
            rows = c.execute(
                "SELECT id, lat, lng FROM issues WHERE category=? AND status NOT IN ('resolved','rejected')",
                (ai.get("category"),),
            ).fetchall()
        for r in rows:
            if r["lat"] is None or r["lng"] is None:
                continue
            if abs(r["lat"] - lat) < 0.0015 and abs(r["lng"] - lng) < 0.0015:
                duplicate_of = r["id"]
                break

    with db() as c:
        if duplicate_of:
            c.execute("UPDATE issues SET upvotes = upvotes + 1 WHERE id=?", (duplicate_of,))
            row = c.execute("SELECT * FROM issues WHERE id=?", (duplicate_of,)).fetchone()
            return {"merged_into": duplicate_of, "issue": dict(row), "ai": ai}

        cur = c.execute(
            """INSERT INTO issues
            (reporter_id, title, description, category, severity, severity_score,
             status, department, ward, lat, lng, image_url)
            VALUES (?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?, ?, ?)""",
            (user["id"], ai.get("title", "Issue"), description,
             ai.get("category"), ai.get("severity"), float(ai.get("severity_score", 50)),
             ai.get("department"), ward, lat, lng, image_url),
        )
        c.execute("UPDATE users SET points = points + 10 WHERE id=?", (user["id"],))
        new_id = cur.lastrowid
        row = c.execute("SELECT * FROM issues WHERE id=?", (new_id,)).fetchone()
    return {"issue": dict(row), "ai": ai}


@router.get("")
def list_issues(
    status: Optional[str] = None,
    ward: Optional[str] = None,
    category: Optional[str] = None,
    user=Depends(current_user),
):
    q = "SELECT * FROM issues WHERE 1=1"
    params = []

    # Citizen
    if user["role"] == "citizen":
        q += " AND reporter_id=?"
        params.append(user["id"])

    # Contractor
    elif user["role"] == "contractor":
        q += " AND assigned_contractor_id=?"
        params.append(user["id"])

    # Authority
    # sees everything

    if status:
        q += " AND status=?"
        params.append(status)

    if ward:
        q += " AND ward=?"
        params.append(ward)

    if category:
        q += " AND category=?"
        params.append(category)

    q += " ORDER BY created_at DESC"

    with db() as c:
        rows = c.execute(q, params).fetchall()

    return [dict(r) for r in rows]


@router.get("/{issue_id}")
def get_issue(issue_id: int):
    with db() as c:
        row = c.execute("SELECT * FROM issues WHERE id=?", (issue_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Not found")
        verifs = c.execute(
            "SELECT v.*, u.name FROM verifications v JOIN users u ON u.id=v.user_id WHERE issue_id=?",
            (issue_id,)).fetchall()
        updates = c.execute("""
               SELECT

                w.*,

                u.name

                FROM work_updates w

                JOIN users u

                ON u.id = w.contractor_id

                WHERE issue_id=?

                ORDER BY created_at DESC

                """,

                (issue_id,)

                ).fetchall()
    return {

    "issue": dict(row),

    "verifications": [dict(v) for v in verifs],

    "updates": [dict(x) for x in updates]

}


@router.post("/{issue_id}/upvote")
def upvote(issue_id: int, user=Depends(current_user)):
    with db() as c:
        try:
            c.execute("INSERT INTO upvotes (user_id, issue_id) VALUES (?, ?)",
                      (user["id"], issue_id))
            c.execute("UPDATE issues SET upvotes = upvotes + 1 WHERE id=?", (issue_id,))
            c.execute("UPDATE users SET points = points + 2 WHERE id=?", (user["id"],))
        except Exception:
            raise HTTPException(400, "Already upvoted")
    return {"ok": True}


@router.post("/{issue_id}/verify")
def verify(issue_id: int, note: str = Form(""), user=Depends(current_user)):
    with db() as c:
        c.execute("INSERT INTO verifications (user_id, issue_id, note) VALUES (?, ?, ?)",
                  (user["id"], issue_id, note))
        c.execute("UPDATE issues SET status='verified' WHERE id=? AND status='reported'",
                  (issue_id,))
        c.execute("UPDATE users SET points = points + 5 WHERE id=?", (user["id"],))
    return {"ok": True}


@router.post("/{issue_id}/assign")
def assign(
    issue_id: int,
    contractor_id: int = Form(...),
    user=Depends(require_authority),
):
    with db() as c:

        issue = c.execute(
            "SELECT * FROM issues WHERE id=?",
            (issue_id,),
        ).fetchone()

        if not issue:
            raise HTTPException(404, "Issue not found")

        contractor = c.execute(
            "SELECT * FROM users WHERE id=? AND role='contractor'",
            (contractor_id,),
        ).fetchone()

        if not contractor:
            raise HTTPException(404, "Contractor not found")

        c.execute(
            """
            UPDATE issues
            SET
                assigned_contractor_id=?,
                assigned_by=?,
                assigned_at=CURRENT_TIMESTAMP,
                work_status='pending',
                status='assigned'
            WHERE id=?
            """,
            (
                contractor_id,
                user["id"],
                issue_id,
            ),
        )

    return {
        "message": "Issue assigned successfully"
    }


@router.post("/{issue_id}/start")
def start_work(issue_id: int, user=Depends(require_authority)):
    with db() as c:
        c.execute("""
            UPDATE issues
            SET work_status='started',
                status='in_progress'
            WHERE id=?
        """, (issue_id,))

    return {"message":"Work Started"}

@router.post("/{issue_id}/progress")
async def upload_progress(

    issue_id: int,

    description: str = Form(...),

    progress_percent: int = Form(...),

    image: UploadFile = File(...),

    user=Depends(current_user)

):

    image_url, _ = await save_upload(image)

    with db() as c:

        c.execute("""

            INSERT INTO work_updates

            (

                issue_id,

                contractor_id,

                description,

                progress_percent,

                image_url

            )

            VALUES (?, ?, ?, ?, ?)

        """,

        (

            issue_id,

            user["id"],

            description,

            progress_percent,

            image_url

        ))

    return {

        "message": "Progress Uploaded"

    }

@router.post("/{issue_id}/resolve")
async def resolve(issue_id: int, image: UploadFile = File(...),
                  user=Depends(require_authority)):
    """Stage 5: contractor uploads after-photo; Gemini verifies."""
    with db() as c:
        row = c.execute("SELECT * FROM issues WHERE id=?", (issue_id,)).fetchone()
    if row["status"] == "waiting_approval":
        raise HTTPException(
            400,
            "Resolution already submitted."
        )
    if not row:
        raise HTTPException(404, "Not found")
    if not row["image_url"]:
        raise HTTPException(400, "Original image missing — cannot verify")

    after_url, after_bytes = await save_upload(image)
    # load original
    import os
    before_path = row["image_url"].lstrip("/")
    before_bytes = open(before_path, "rb").read() if os.path.exists(before_path) else b""

    verdict = compare_before_after(before_bytes, after_bytes)

    print("VERDICT =", verdict)

    new_status = "waiting_approval" if verdict.get("resolved") else "in_progress"

    print("NEW STATUS =", new_status)

    recur = predict_recurrence(row["title"], f"Contractor #{user['id']}")
    risk = float(recur.get("d90", 0.4))

    with db() as c:
        c.execute(
            """UPDATE issues
                SET

                resolution_image_url=?,

                status=?,

                recurrence_risk=?

                WHERE id=?""",
            (after_url, new_status, risk,issue_id))
    return {"status": new_status, "verdict": verdict, "recurrence": recur}


@router.post("/{issue_id}/approve")
def approve_issue(issue_id:int):

    with db() as c:

        issue = c.execute(
            """
            SELECT assigned_contractor_id
            FROM issues
            WHERE id=?
            """,
            (issue_id,)
        ).fetchone()

        if not issue:
            raise HTTPException(404,"Issue not found")

        worker_id = issue["assigned_contractor_id"]

        officer_id = 4

        c.execute("""
            UPDATE issues
            SET status='resolved'
            WHERE id=?
        """,(issue_id,))

        c.execute("""
            UPDATE users
            SET points=points+100
            WHERE id=?
        """,(worker_id,))

        c.execute("""
            UPDATE users
            SET points=points+150
            WHERE id=?
        """,(officer_id,))

    return {"success":True}



@router.post("/{issue_id}/reject")
def reject_issue(

    issue_id:int,

    reason:str=Form(...),

    user=Depends(require_authority)

):

    with db() as c:

        c.execute("""

        UPDATE issues

        SET

            status='in_progress'

        WHERE id=?

        """,

        (issue_id,)

        )

    return {

        "message":"Issue Rejected"

    }