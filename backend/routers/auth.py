from fastapi import APIRouter, Depends, HTTPException
from models.schemas import SignupReq, LoginReq, TokenResp
from services.db import db
from services.auth import hash_password, verify_password, make_token, current_user

router = APIRouter()


@router.post("/signup", response_model=TokenResp)
def signup(req: SignupReq):
    with db() as c:
        exists = c.execute("SELECT 1 FROM users WHERE email=?", (req.email,)).fetchone()
        if exists:
            raise HTTPException(400, "Email already registered")
        cur = c.execute(
            "INSERT INTO users (name, email, password_hash, role, ward) VALUES (?, ?, ?, ?, ?)",
            (req.name, req.email, hash_password(req.password), req.role, req.ward),
        )
        uid = cur.lastrowid
        row = c.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    user = {k: row[k] for k in row.keys() if k != "password_hash"}
    return TokenResp(access_token=make_token(uid), user=user)


@router.post("/login", response_model=TokenResp)
def login(req: LoginReq):
    with db() as c:
        row = c.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
    if not row or not verify_password(req.password, row["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    user = {k: row[k] for k in row.keys() if k != "password_hash"}
    return TokenResp(access_token=make_token(row["id"]), user=user)


@router.get("/me")
def me(user=Depends(current_user)):
    user.pop("password_hash", None)
    return user
