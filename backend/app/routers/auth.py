from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import LoginIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return TokenOut(token=create_token(user), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
