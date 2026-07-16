from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import assert_can_access, require_approved
from app.database import get_db
from app.models import AttendanceRecord, Holiday, User
from app.schemas import (
    AttendanceOut,
    DayOut,
    GeoIn,
    StatsOut,
    TimesheetOut,
)
from app.services.geo import is_out_of_zone
from app.services.settings_store import get_office, local_today
from app.services.timesheet import compute_stats, is_weekend_or_holiday

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


def _open_record(db: Session, user_id: int) -> AttendanceRecord | None:
    return db.scalar(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.check_out.is_(None),
        )
    )


@router.post("/check-in", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def check_in(data: GeoIn, db: Session = Depends(get_db), user: User = Depends(require_approved)):
    if _open_record(db, user.id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Есть незакрытая смена")

    office = get_office(db)
    rec = AttendanceRecord(
        user_id=user.id,
        work_date=local_today(),
        check_in=datetime.now(timezone.utc),
        lat_in=data.lat,
        lng_in=data.lng,
        out_of_zone_in=is_out_of_zone(data.lat, data.lng, *office),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.post("/check-out", response_model=AttendanceOut)
def check_out(data: GeoIn, db: Session = Depends(get_db), user: User = Depends(require_approved)):
    rec = _open_record(db, user.id)
    if not rec:
        raise HTTPException(status.HTTP_409_CONFLICT, "Нет открытой смены")

    office = get_office(db)
    rec.check_out = datetime.now(timezone.utc)
    rec.lat_out = data.lat
    rec.lng_out = data.lng
    rec.out_of_zone_out = is_out_of_zone(data.lat, data.lng, *office)
    db.commit()
    db.refresh(rec)
    return rec


@router.get("/status", response_model=AttendanceOut | None)
def status_open(db: Session = Depends(get_db), user: User = Depends(require_approved)):
    return _open_record(db, user.id)


def _month_start() -> date:
    t = local_today()
    return t.replace(day=1)


def build_timesheet(db: Session, target: User, start: date, end: date) -> TimesheetOut:
    records = db.scalars(
        select(AttendanceRecord)
        .where(
            AttendanceRecord.user_id == target.id,
            AttendanceRecord.work_date >= start,
            AttendanceRecord.work_date <= end,
        )
        .order_by(AttendanceRecord.work_date)
    ).all()
    holidays = {h.date for h in db.scalars(select(Holiday)).all()}

    tuples = [(r.work_date, r.check_in, r.check_out) for r in records]
    stats = compute_stats(tuples, holidays, target.hire_date, start, end)

    days = []
    for r in records:
        hours = 0.0
        if r.check_out:
            hours = round((r.check_out - r.check_in).total_seconds() / 3600, 2)
        days.append(
            DayOut(
                date=r.work_date,
                check_in=r.check_in,
                check_out=r.check_out,
                hours=hours,
                is_weekend=is_weekend_or_holiday(r.work_date, holidays),
                is_manual=r.is_manual,
                out_of_zone_in=r.out_of_zone_in,
            )
        )
    return TimesheetOut(stats=StatsOut(**stats.__dict__), days=days)


@router.get("/timesheet", response_model=TimesheetOut)
def my_timesheet(
    start: date | None = None,
    end: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_approved),
):
    return build_timesheet(db, user, start or _month_start(), end or local_today())


@router.get("/timesheet/{user_id}", response_model=TimesheetOut)
def user_timesheet(
    user_id: int,
    start: date | None = None,
    end: date | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(require_approved),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    assert_can_access(current, target)
    return build_timesheet(db, target, start or _month_start(), end or local_today())
