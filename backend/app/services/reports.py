"""Сводка и рейтинг — поверх чистого compute_stats."""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ROLE_WORKER, AttendanceRecord, Holiday, User
from app.services.settings_store import TZ
from app.services.timesheet import compute_stats, is_weekend_or_holiday

WORK_START_HOUR = 9  # позже — опоздание
# веса рейтинга
W_OVERTIME = 2.0
W_HOURS = 0.1
W_LATENESS = 3.0


def _holidays(db: Session) -> set[date]:
    return {h.date for h in db.scalars(select(Holiday)).all()}


def _records_for(db: Session, user_id: int, start: date, end: date):
    return db.scalars(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.work_date >= start,
            AttendanceRecord.work_date <= end,
        )
    ).all()


def summary(db: Session, users: list[User], start: date, end: date) -> list[dict]:
    holidays = _holidays(db)
    rows = []
    for u in users:
        recs = _records_for(db, u.id, start, end)
        stats = compute_stats(
            [(r.work_date, r.check_in, r.check_out) for r in recs],
            holidays,
            u.hire_date,
            start,
            end,
        )
        rows.append(
            {
                "user_id": u.id,
                "full_name": u.full_name,
                "audience": u.audience,
                "hire_date": u.hire_date,
                **stats.__dict__,
            }
        )
    return rows


def rating(db: Session, users: list[User], start: date, end: date) -> list[dict]:
    holidays = _holidays(db)
    rows = []
    for u in users:
        recs = _records_for(db, u.id, start, end)
        stats = compute_stats(
            [(r.work_date, r.check_in, r.check_out) for r in recs], holidays, u.hire_date, start, end
        )
        lateness = 0
        for r in recs:
            if is_weekend_or_holiday(r.work_date, holidays):
                continue
            local_in = r.check_in.astimezone(TZ)
            if (local_in.hour, local_in.minute) > (WORK_START_HOUR, 0):
                lateness += 1
        score = (
            stats.overtime * W_OVERTIME
            + stats.total_hours * W_HOURS
            - lateness * W_LATENESS
        )
        rows.append(
            {
                "user_id": u.id,
                "full_name": u.full_name,
                "audience": u.audience,
                "total_hours": stats.total_hours,
                "overtime": stats.overtime,
                "weekend_hours": stats.weekend_hours,
                "lateness": lateness,
                "score": round(score, 2),
            }
        )
    rows.sort(key=lambda r: r["score"], reverse=True)
    return rows


def workers_in_scope(db: Session, audience: str | None = None) -> list[User]:
    """Работники (admin и leader видят всех); audience — опциональный фильтр."""
    q = select(User).where(User.role == ROLE_WORKER, User.is_active.is_(True))
    if audience:
        q = q.where(User.audience == audience)
    return list(db.scalars(q.order_by(User.full_name)).all())
