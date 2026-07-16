from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Setting

TZ = ZoneInfo(settings.app_tz)


def get_office(db: Session) -> tuple[float, float, float]:
    """Координаты и радиус геозоны из таблицы settings (сидируются при старте)."""
    rows = {s.key: s.value for s in db.query(Setting).all()}
    return (
        float(rows.get("office_lat", settings.office_lat)),
        float(rows.get("office_lng", settings.office_lng)),
        float(rows.get("office_radius_m", settings.office_radius_m)),
    )


def local_today():
    return datetime.now(TZ).date()


def to_utc(dt: datetime) -> datetime:
    """Наивное время трактуем как локальное (APP_TZ), храним в UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TZ)
    return dt.astimezone(timezone.utc)
