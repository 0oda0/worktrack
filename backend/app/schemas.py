from datetime import date, datetime

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


class GeoIn(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class AttendanceOut(BaseModel):
    id: int
    user_id: int
    work_date: date
    check_in: datetime
    check_out: datetime | None
    out_of_zone_in: bool
    out_of_zone_out: bool
    is_manual: bool
    comment: str

    model_config = {"from_attributes": True}


class DayOut(BaseModel):
    date: date
    check_in: datetime
    check_out: datetime | None
    hours: float
    is_weekend: bool
    is_manual: bool
    out_of_zone_in: bool


class StatsOut(BaseModel):
    total_hours: float
    work_hours: float
    paid_hours: float
    overtime: float
    weekend_hours: float


class TimesheetOut(BaseModel):
    stats: StatsOut
    days: list[DayOut]


class HolidayIn(BaseModel):
    date: date
    name: str = Field(min_length=1, max_length=200)


class HolidayOut(BaseModel):
    id: int
    date: date
    name: str

    model_config = {"from_attributes": True}


class WorkRequestIn(BaseModel):
    work_date: date
    check_in: datetime
    check_out: datetime | None = None
    comment: str = Field(default="", max_length=1000)


class WorkRequestOut(BaseModel):
    id: int
    user_id: int
    work_date: date
    check_in: datetime
    check_out: datetime | None
    comment: str
    status: str
    reviewed_by: int | None
    review_comment: str

    model_config = {"from_attributes": True}


class ReviewIn(BaseModel):
    comment: str = Field(default="", max_length=1000)


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
