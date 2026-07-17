import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import assert_can_access, require_roles
from app.database import get_db
from app.models import (
    ROLE_ADMIN,
    ROLE_LEADER,
    AttendanceRecord,
    Setting,
    User,
)
from app.schemas import (
    AdminRecordOut,
    ApproveIn,
    NowWorkingOut,
    RecordUpdateIn,
    SettingsIn,
    SettingsOut,
    UserOut,
    UserUpdateIn,
)
from app.services.settings_store import get_office, to_utc

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------- пользователи ----------

@router.get("/users/pending", response_model=list[UserOut])
def pending_users(db: Session = Depends(get_db), _: User = Depends(require_roles(ROLE_ADMIN))):
    return db.scalars(select(User).where(User.is_approved.is_(False))).all()


@router.get("/users", response_model=list[UserOut])
def list_users(
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    q = select(User).order_by(User.full_name)
    if audience:
        q = q.where(User.audience == audience)
    return db.scalars(q).all()


@router.post("/users/{user_id}/approve", response_model=UserOut)
def approve_user(
    user_id: int,
    data: ApproveIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    try:
        data.validate_audience()
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(e))

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if user.is_approved:
        raise HTTPException(status.HTTP_409_CONFLICT, "User already approved")

    user.role = data.role
    user.audience = None if data.role == ROLE_ADMIN else data.audience
    user.hire_date = data.hire_date
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    fields = data.model_dump(exclude_unset=True)
    if fields.get("role") == ROLE_ADMIN:
        user.audience = None
    for k, v in fields.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


# ---------- отметки (просмотр/правка/удаление) ----------

def _record_row(r: AttendanceRecord, u: User) -> AdminRecordOut:
    return AdminRecordOut(
        id=r.id,
        user_id=r.user_id,
        full_name=u.full_name,
        audience=u.audience,
        work_date=r.work_date,
        check_in=r.check_in,
        check_out=r.check_out,
        lat_in=r.lat_in,
        lng_in=r.lng_in,
        lat_out=r.lat_out,
        lng_out=r.lng_out,
        out_of_zone_in=r.out_of_zone_in,
        out_of_zone_out=r.out_of_zone_out,
        is_manual=r.is_manual,
        comment=r.comment,
    )


@router.get("/records", response_model=list[AdminRecordOut])
def list_records(
    user_id: int | None = None,
    audience: str | None = None,
    start: date | None = None,
    end: date | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    q = select(AttendanceRecord, User).join(User, AttendanceRecord.user_id == User.id)
    if audience:
        q = q.where(User.audience == audience)
    if user_id:
        q = q.where(AttendanceRecord.user_id == user_id)
    if start:
        q = q.where(AttendanceRecord.work_date >= start)
    if end:
        q = q.where(AttendanceRecord.work_date <= end)
    q = q.order_by(AttendanceRecord.work_date.desc())
    return [_record_row(r, u) for r, u in db.execute(q).all()]


def _get_record_scoped(db: Session, current: User, record_id: int) -> AttendanceRecord:
    rec = db.get(AttendanceRecord, record_id)
    if not rec:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Запись не найдена")
    assert_can_access(current, db.get(User, rec.user_id))
    return rec


@router.patch("/records/{record_id}", response_model=AdminRecordOut)
def update_record(
    record_id: int,
    data: RecordUpdateIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    rec = _get_record_scoped(db, current, record_id)
    fields = data.model_dump(exclude_unset=True)
    for k, v in fields.items():
        if k in ("check_in", "check_out") and v is not None:
            v = to_utc(v)
        setattr(rec, k, v)
    if rec.check_out is not None and rec.check_out <= rec.check_in:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Уход должен быть позже прихода")
    db.commit()
    db.refresh(rec)
    return _record_row(rec, db.get(User, rec.user_id))


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    rec = _get_record_scoped(db, current, record_id)
    db.delete(rec)
    db.commit()


@router.get("/now-working", response_model=list[NowWorkingOut])
def now_working(
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    q = (
        select(AttendanceRecord, User)
        .join(User, AttendanceRecord.user_id == User.id)
        .where(AttendanceRecord.check_out.is_(None))
    )
    if audience:
        q = q.where(User.audience == audience)
    return [
        NowWorkingOut(
            user_id=u.id,
            full_name=u.full_name,
            audience=u.audience,
            check_in=r.check_in,
            out_of_zone_in=r.out_of_zone_in,
        )
        for r, u in db.execute(q).all()
    ]


# ---------- настройки геозоны ----------

@router.get("/settings", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), _: User = Depends(require_roles(ROLE_ADMIN))):
    polygon, lat, lng, radius = get_office(db)
    return SettingsOut(
        office_lat=lat, office_lng=lng, office_radius_m=radius, office_polygon=polygon
    )


@router.put("/settings", response_model=SettingsOut)
def update_settings(
    data: SettingsIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    values = {
        "office_lat": str(data.office_lat),
        "office_lng": str(data.office_lng),
        "office_radius_m": str(data.office_radius_m),
        # пустой полигон храним как "" → get_polygon вернёт None (откат на круг)
        "office_polygon": json.dumps(data.office_polygon) if data.office_polygon else "",
    }
    for key, value in values.items():
        row = db.get(Setting, key)
        if row:
            row.value = value
        else:
            db.add(Setting(key=key, value=value))
    db.commit()
    return SettingsOut(**data.model_dump())
