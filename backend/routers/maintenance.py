from fastapi import APIRouter, Depends, Form, HTTPException
from services.auth import current_user
from services.db import db
from fastapi import UploadFile, File
import os
import shutil
import uuid

router = APIRouter()



# --------------------------------------------------------
# Create Maintenance Task (Officer)
# --------------------------------------------------------
@router.post("/tasks")
def create_task(
    squad_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    location: str = Form(""),
    due_date: str = Form(""),
    priority: str = Form("Medium"),
    user=Depends(current_user)
):

    if user["role"] != "authority":
        raise HTTPException(
            status_code=403,
            detail="Only municipal officers can create maintenance tasks."
        )

    with db() as c:

        cur = c.execute(
            """
            INSERT INTO maintenance_tasks
            (
                squad_id,
                title,
                description,
                location,
                due_date,
                priority,
                created_by
            )
            VALUES
            (
                ?,?,?,?,?,?,?
            )
            """,
            (
                squad_id,
                title,
                description,
                location,
                due_date,
                priority,
                user["id"]
            )
        )

    return {
        "success": True,
        "id": cur.lastrowid
    }


# --------------------------------------------------------
# Get All Tasks
# --------------------------------------------------------
@router.get("/tasks")
def list_tasks(user=Depends(current_user)):

    with db() as c:

        rows = c.execute(
            """
            SELECT

                t.*,

                s.name AS squad_name,

                s.ward

            FROM maintenance_tasks t

            LEFT JOIN squads s

            ON t.squad_id = s.id

            ORDER BY t.created_at DESC
            """
        ).fetchall()

    return [dict(r) for r in rows]


# --------------------------------------------------------
# Get Single Task
# --------------------------------------------------------
@router.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    user=Depends(current_user)
):

    with db() as c:

        row = c.execute(
            """
            SELECT

                t.*,

                s.name AS squad_name,

                s.ward

            FROM maintenance_tasks t

            LEFT JOIN squads s

            ON t.squad_id=s.id

            WHERE t.id=?
            """,
            (task_id,)
        ).fetchone()

    if not row:
        raise HTTPException(
            404,
            "Task not found."
        )

    return dict(row)


# --------------------------------------------------------
# My Maintenance Tasks (Worker)
# --------------------------------------------------------

@router.get("/my-tasks")
def my_tasks(user=Depends(current_user)):

    with db() as c:

        rows = c.execute(
            """
            SELECT

                t.*,

                s.name AS squad_name,

                s.ward

            FROM maintenance_tasks t

            INNER JOIN squad_members sm

                ON sm.squad_id = t.squad_id

            INNER JOIN squads s

                ON s.id = t.squad_id

            WHERE sm.user_id=?

            ORDER BY t.created_at DESC
            """,
            (
                user["id"],
            )
        ).fetchall()

    return [dict(r) for r in rows]

@router.post("/submit/{task_id}")
def submit_task(

    task_id:int,

    remarks:str=Form(""),

    before_image:UploadFile=File(...),

    after_image:UploadFile=File(...),

    user=Depends(current_user)

):

    upload_dir="uploads"

    os.makedirs(upload_dir,exist_ok=True)

    before_name=f"{uuid.uuid4()}_{before_image.filename}"

    after_name=f"{uuid.uuid4()}_{after_image.filename}"

    before_path=os.path.join(upload_dir,before_name)

    after_path=os.path.join(upload_dir,after_name)

    with open(before_path,"wb") as buffer:

        shutil.copyfileobj(before_image.file,buffer)

    with open(after_path,"wb") as buffer:

        shutil.copyfileobj(after_image.file,buffer)

    with db() as c:
        existing = c.execute(
            """
            SELECT id
            FROM maintenance_submissions
            WHERE task_id=? AND worker_id=?
            """,
            (task_id, user["id"])
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="You have already submitted this task."
            )

        c.execute(

            """
            INSERT INTO maintenance_submissions
            (
                task_id,
                worker_id,
                before_photo,
                after_photo,
                remarks,
                status
            )
            VALUES
            (
                ?,?,?,?,?,?
            )
            """,

            (

                task_id,

                user["id"],

                before_name,

                after_name,

                remarks,

                "Pending"

            )

        )

        c.execute(

            """
            UPDATE maintenance_tasks

            SET status='Pending Approval'

            WHERE id=?
            """,

            (task_id,)

        )

    return {

        "success":True

    }


# --------------------------------------------------------
# Pending Submissions (Officer)
# --------------------------------------------------------

@router.get("/pending-submissions")
def pending_submissions(user=Depends(current_user)):

    if user["role"] != "authority":
        raise HTTPException(403, "Only officers allowed.")

    with db() as c:

        rows = c.execute(
            """
            SELECT

                ms.id,
                ms.task_id,
                ms.before_photo,
                ms.after_photo,
                ms.remarks,
                ms.status,

                mt.title AS task_title,

                u.name AS worker_name

            FROM maintenance_submissions ms

            JOIN maintenance_tasks mt

                ON mt.id = ms.task_id

            JOIN users u

                ON u.id = ms.worker_id

            WHERE ms.status='Pending'

            ORDER BY ms.submitted_at DESC
            """
        ).fetchall()

    return [dict(r) for r in rows]


# --------------------------------------------------------
# Approve Submission
# --------------------------------------------------------

@router.post("/approve/{submission_id}")
def approve_submission(
    submission_id: int,
    user=Depends(current_user)
):

    if user["role"] != "authority":
        raise HTTPException(403, "Only officers allowed.")

    with db() as c:

        sub = c.execute(
            """
            SELECT *
            FROM maintenance_submissions
            WHERE id=?
            """,
            (submission_id,)
        ).fetchone()

        if not sub:
            raise HTTPException(404, "Submission not found.")

        c.execute(
            """
            UPDATE maintenance_submissions
            SET status='Approved'
            WHERE id=?
            """,
            (submission_id,)
        )

        c.execute(
            """
            UPDATE maintenance_tasks
            SET status='Completed'
            WHERE id=?
            """,
            (sub["task_id"],)
        )

        c.execute(
            """
            UPDATE users
            SET points=points+50
            WHERE id=?
            """,
            (sub["worker_id"],)
        )

    return {
        "success": True
    }


# --------------------------------------------------------
# Reject Submission
# --------------------------------------------------------

@router.post("/reject/{submission_id}")
def reject_submission(
    submission_id: int,
    user=Depends(current_user)
):

    if user["role"] != "authority":
        raise HTTPException(403, "Only officers allowed.")

    with db() as c:

        sub = c.execute(
            """
            SELECT *
            FROM maintenance_submissions
            WHERE id=?
            """,
            (submission_id,)
        ).fetchone()

        if not sub:
            raise HTTPException(404, "Submission not found.")

        c.execute(
            """
            UPDATE maintenance_submissions
            SET status='Rejected'
            WHERE id=?
            """,
            (submission_id,)
        )

        c.execute(
            """
            UPDATE maintenance_tasks
            SET status='Assigned'
            WHERE id=?
            """,
            (sub["task_id"],)
        )

    return {
        "success": True
    }