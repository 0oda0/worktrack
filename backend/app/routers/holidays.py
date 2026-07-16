from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_approved, require_roles
from app.database import get_db
from app.models import ROLE_ADMIN, Holiday, User
from app.schemas import HolidayIn, HolidayOut

router = APIRouter(prefix="/api/holidays", tags=["holidays"])


@router.get("", response_model=list[HolidayOut])
def list_holidays(db: Session = Depends(get_db), _: User = Depends(require_approved)):
    return db.scalars(select(Holiday).order_by(Holiday.date)).all()


@router.post("", response_model=HolidayOut, status_code=status.HTTP_201_CREATED)
def add_holiday(
    data: HolidayIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    if db.scalar(select(Holiday).where(Holiday.date == data.date)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Дата уже отмечена как праздник")
    h = Holiday(date=data.date, name=data.name)
    db.add(h)
    db.commit()
    db.refresh(h)
    return h


@router.delete("/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(
    holiday_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    h = db.get(Holiday, holiday_id)
    if not h:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    db.delete(h)
    db.commit()
