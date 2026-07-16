import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import ROLE_ADMIN, Setting, User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed(db: Session) -> None:
    """Идемпотентно: первый админ + дефолтные настройки геозоны."""
    if not db.scalar(select(User).where(User.email == settings.admin_email)):
        db.add(
            User(
                full_name="Администратор",
                email=settings.admin_email,
                password_hash=hash_password(settings.admin_password),
                role=ROLE_ADMIN,
                is_approved=True,
            )
        )

    defaults = {
        "office_lat": str(settings.office_lat),
        "office_lng": str(settings.office_lng),
        "office_radius_m": str(settings.office_radius_m),
    }
    for key, value in defaults.items():
        if not db.get(Setting, key):
            db.add(Setting(key=key, value=value))

    db.commit()
