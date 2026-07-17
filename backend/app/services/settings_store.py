import json
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Setting

TZ = ZoneInfo(settings.app_tz)


def get_polygon(db: Session) -> list[list[float]] | None:
    """Полигон геозоны (кольцо [lng,lat]) из settings, либо None если не задан/битый."""
    row = db.get(Setting, "office_polygon")
    if not row or not row.value:
        return None
    try:
        ring = json.loads(row.value)
    except (ValueError, TypeError):
        return None
    return ring if isinstance(ring, list) and len(ring) >= 3 else None


def get_office(db: Session) -> tuple[list[list[float]] | None, float, float, float]:
    """Геозона: полигон (или None) + точка/радиус круга (fallback). Сидируются при старте."""
    rows = {s.key: s.value for s in db.query(Setting).all()}
    polygon = get_polygon(db)
    return (
        polygon,
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
