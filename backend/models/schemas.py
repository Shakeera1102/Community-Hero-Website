from pydantic import BaseModel, EmailStr
from typing import Optional


class SignupReq(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "citizen"
    ward: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class IssueOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    severity: Optional[str]
    severity_score: float
    status: str
    department: Optional[str]
    ward: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    image_url: Optional[str]
    resolution_image_url: Optional[str]
    upvotes: int
    recurrence_risk: float
    reporter_id: int
    created_at: str
