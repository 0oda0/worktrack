from datetime import datetime
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
