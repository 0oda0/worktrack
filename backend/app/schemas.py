from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.models import AUDIENCES, ROLES


class RegisterIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    audience: str | None
    hire_date: date | None
    is_approved: bool

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    token: str
    user: UserOut


class ApproveIn(BaseModel):
    role: str = Field(pattern="^(" + "|".join(ROLES) + ")$")
    audience: str | None = None
    hire_date: date

    def validate_audience(self) -> None:
        # leader/worker обязаны иметь аудиторию из списка; admin — без аудитории
        if self.role == "admin":
            return
        if self.audience not in AUDIENCES:
            raise ValueError(f"audience must be one of {AUDIENCES}")
