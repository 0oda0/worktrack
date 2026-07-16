from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

# Роли и аудитории — строки, не PG-enum: добавление значения не требует миграции
ROLE_ADMIN = "admin"
ROLE_LEADER = "leader"
ROLE_WORKER = "worker"
ROLES = (ROLE_ADMIN, ROLE_LEADER, ROLE_WORKER)

AUDIENCES = ("203", "903", "906")

REQUEST_PENDING = "pending"
REQUEST_APPROVED = "approved"
REQUEST_REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default=ROLE_WORKER)
    audience: Mapped[str | None] = mapped_column(String(10))
    hire_date: Mapped[date | None] = mapped_column(Date)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    work_date: Mapped[date] = mapped_column(Date, index=True)
    check_in: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    lat_in: Mapped[float | None] = mapped_column(Float)
    lng_in: Mapped[float | None] = mapped_column(Float)
    lat_out: Mapped[float | None] = mapped_column(Float)
    lng_out: Mapped[float | None] = mapped_column(Float)
    out_of_zone_in: Mapped[bool] = mapped_column(Boolean, default=False)
    out_of_zone_out: Mapped[bool] = mapped_column(Boolean, default=False)
    is_manual: Mapped[bool] = mapped_column(Boolean, default=False)
    comment: Mapped[str] = mapped_column(Text, default="")


class WorkRequest(Base):
    __tablename__ = "work_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    work_date: Mapped[date] = mapped_column(Date)
    check_in: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # None ⇔ запрос на сегодня: запись останется открытой до обычного check-out
    check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    comment: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default=REQUEST_PENDING)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    review_comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Holiday(Base):
    __tablename__ = "holidays"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date] = mapped_column(Date, unique=True)
    name: Mapped[str] = mapped_column(String(200))


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(50), primary_key=True)
    value: Mapped[str] = mapped_column(String(200))
