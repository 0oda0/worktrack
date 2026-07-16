from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import ROLE_ADMIN, User
from app.schemas import ApproveIn, UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users/pending", response_model=list[UserOut])
def pending_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN)),
):
    return db.scalars(select(User).where(User.is_approved.is_(False))).all()


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
