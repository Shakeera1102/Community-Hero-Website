from fastapi import APIRouter, Depends
from services.db import db
from services.auth import require_authority

router = APIRouter()


@router.get("")
def get_contractors(user=Depends(require_authority)):
    with db() as c:
        rows = c.execute(
            """
            SELECT
                id,
                name,
                email,
                ward,
                points
            FROM users
            WHERE role='contractor'
            ORDER BY name
            """
        ).fetchall()

    return [dict(r) for r in rows]