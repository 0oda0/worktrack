from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import assert_can_access, require_approved, require_roles
from app.database import get_db
from app.models import (
    REQUEST_APPROVED,
    REQUEST_PENDING,
    REQUEST_REJECTED,
    ROLE_ADMIN,
    ROLE_LEADER,
    AttendanceRecord,
    User,
    WorkRequest,
)
from app.routers.attendance import _open_record
from app.schemas import ReviewIn, WorkRequestIn, WorkRequestOut
from app.services.settings_store import local_today, to_utc

router = APIRouter(prefix="/api/requests", tags=["requests"])


@router.post("", response_model=WorkRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    data: WorkRequestIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_approved),
):
    today = local_today()
    if data.work_date > today:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Дата не может быть в будущем")

    check_in = to_utc(data.check_in)
    check_out = to_utc(data.check_out) if data.check_out else None

    if data.work_date == today:
        # сегодня — запись закрывается обычным check-out, время ухода не указывается
        if check_out is not None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "Для сегодняшней даты время ухода не указывается",
            )
    else:
        if check_out is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "Для прошедшей даты укажите время ухода",
            )
        if check_in >= check_out:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY, "Приход должен быть раньше ухода"
            )

    req = WorkRequest(
        user_id=user.id,
        work_date=data.work_date,
        check_in=check_in,
        check_out=check_out,
        comment=data.comment,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/my", response_model=list[WorkRequestOut])
def my_requests(db: Session = Depends(get_db), user: User = Depends(require_approved)):
    return db.scalars(
        select(WorkRequest)
        .where(WorkRequest.user_id == user.id)
        .order_by(WorkRequest.created_at.desc())
    ).all()


@router.get("/pending", response_model=list[WorkRequestOut])
def pending_requests(
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    q = (
        select(WorkRequest)
        .join(User, WorkRequest.user_id == User.id)
        .where(WorkRequest.status == REQUEST_PENDING)
        .order_by(WorkRequest.created_at)
    )
    if audience:
        q = q.where(User.audience == audience)
    return db.scalars(q).all()


def _load_pending(db: Session, current: User, request_id: int) -> tuple[WorkRequest, User]:
    req = db.get(WorkRequest, request_id)
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Запрос не найден")
    if req.status != REQUEST_PENDING:
        raise HTTPException(status.HTTP_409_CONFLICT, "Запрос уже обработан")
    target = db.get(User, req.user_id)
    assert_can_access(current, target)  # leader и admin — любой сотрудник
    return req, target


@router.post("/{request_id}/approve", response_model=WorkRequestOut)
def approve(
    request_id: int,
    data: ReviewIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    req, _ = _load_pending(db, current, request_id)

    # запрос «на сегодня» → открытая смена; нельзя, если уже есть незакрытая
    if req.check_out is None and _open_record(db, req.user_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "У сотрудника уже есть открытая смена")

    # ponytail: создаём новую запись; дедуп — на совести ревьюера (он и так смотрит вручную)
    db.add(
        AttendanceRecord(
            user_id=req.user_id,
            work_date=req.work_date,
            check_in=req.check_in,
            check_out=req.check_out,
            is_manual=True,
            comment=req.comment,
        )
    )
    req.status = REQUEST_APPROVED
    req.reviewed_by = current.id
    req.review_comment = data.comment
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/reject", response_model=WorkRequestOut)
def reject(
    request_id: int,
    data: ReviewIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    req, _ = _load_pending(db, current, request_id)
    req.status = REQUEST_REJECTED
    req.reviewed_by = current.id
    req.review_comment = data.comment
    db.commit()
    db.refresh(req)
    return req
