from datetime import date
from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import ROLE_ADMIN, ROLE_LEADER, User
from app.schemas import RatingRowOut, SummaryRowOut
from app.services import reports
from app.services.settings_store import local_today

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _period(start: date | None, end: date | None) -> tuple[date, date]:
    return (start or local_today().replace(day=1), end or local_today())


@router.get("/summary", response_model=list[SummaryRowOut])
def summary(
    start: date | None = None,
    end: date | None = None,
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    s, e = _period(start, end)
    return reports.summary(db, reports.workers_in_scope(db, audience), s, e)


@router.get("/rating", response_model=list[RatingRowOut])
def rating(
    start: date | None = None,
    end: date | None = None,
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    s, e = _period(start, end)
    return reports.rating(db, reports.workers_in_scope(db, audience), s, e)


@router.get("/export.xlsx")
def export_xlsx(
    start: date | None = None,
    end: date | None = None,
    audience: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(ROLE_ADMIN, ROLE_LEADER)),
):
    s, e = _period(start, end)
    report = reports.session_report(db, reports.workers_in_scope(db, audience), s, e)

    title = f"Сектор_{audience}" if audience else "Отчёт"
    wb = reports.export_workbook(report, title)

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    # кириллица в имени: ASCII-фолбэк + RFC 5987 (заголовки HTTP — latin-1)
    sector = audience or "все"
    utf8_name = quote(f"Отчет_{sector}_{s:%Y%m%d}-{e:%Y%m%d}.xlsx")
    disposition = (
        f"attachment; filename=report_{s:%Y%m%d}-{e:%Y%m%d}.xlsx; filename*=UTF-8''{utf8_name}"
    )
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": disposition},
    )
