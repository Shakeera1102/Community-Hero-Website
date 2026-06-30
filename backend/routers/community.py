"""Fix-It squads."""
from fastapi import APIRouter, Depends, Form, HTTPException
from services.db import db
from services.auth import current_user

router = APIRouter()


@router.get("/squads")
def list_squads(user=Depends(current_user)):
    with db() as c:
        rows = c.execute(
            """
            SELECT
                s.*,
                u.name AS leader_name,

                (
                    SELECT COUNT(*)
                    FROM squad_members
                    WHERE squad_id=s.id
                ) AS members,

                EXISTS(
                    SELECT 1
                    FROM squad_members
                    WHERE
                    squad_id=s.id
                    AND
                    user_id=?
                ) AS joined

            FROM squads s

            LEFT JOIN users u

            ON u.id=s.leader_id
            """,

            (user["id"],)

        ).fetchall()
    return [dict(r) for r in rows]


@router.post("/squads")
def create_squad(
    name: str = Form(...),
    description: str = Form(""),
    ward: str = Form(""),
    type: str = Form(...),
    user=Depends(current_user)
):

    if user["role"] != "authority":
        raise HTTPException(
            status_code=403,
            detail="Only municipal officers can create official teams."
        )

    with db() as c:
        cur = c.execute(
            """
            INSERT INTO squads
            (
                name,
                description,
                ward,
                leader_id,
                type
            )
            VALUES
            (?, ?, ?, ?, ?)
            """,
            (
                name,
                description,
                ward,
                user["id"],
                "official"
            )
        )

        sid = cur.lastrowid

        c.execute(
            """
            INSERT INTO squad_members
            (squad_id,user_id)
            VALUES (?,?)
            """,
            (sid,user["id"])
        )

    return {"id":sid}


@router.post("/squads/{sid}/join")
def join(sid: int, user=Depends(current_user)):
    with db() as c:
        try:
            c.execute("INSERT INTO squad_members (squad_id, user_id) VALUES (?, ?)",
                      (sid, user["id"]))
            c.execute("UPDATE users SET points = points + 15 WHERE id=?", (user["id"],))
        except Exception:
            raise HTTPException(400, "Already a member")
    return {"ok": True}

@router.delete("/squads/{sid}")
def delete_squad(
    sid:int,
    user=Depends(current_user)
):

    with db() as c:

        squad = c.execute(
            """
            SELECT *
            FROM squads
            WHERE id=?
            """,
            (sid,)
        ).fetchone()

        if not squad:
            raise HTTPException(404,"Not Found")

        if squad["leader_id"] != user["id"]:

            raise HTTPException(
                403,
                "Only leader can delete."
            )

        c.execute(
            "DELETE FROM squad_members WHERE squad_id=?",
            (sid,)
        )

        c.execute(
            "DELETE FROM squads WHERE id=?",
            (sid,)
        )

    return {
        "success":True
    }

@router.post("/squads/{sid}/leave")
def leave(
    sid:int,
    user=Depends(current_user)
):

    with db() as c:

        c.execute(
            """
            DELETE FROM squad_members
            WHERE
            squad_id=?
            AND
            user_id=?
            """,
            (
                sid,
                user["id"]
            )
        )

    return {
        "success":True
    }
