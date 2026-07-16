from datetime import date
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
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
    rows = reports.summary(db, reports.workers_in_scope(db, audience), s, e)

    wb = Workbook()
    ws = wb.active
    ws.title = "Табель"
    headers = [
        "ФИО", "Аудитория", "Дата трудоустройства",
        "Всего часов", "Норма (9ч)", "Оплачиваемые (8ч)", "Переработка", "Выходные",
    ]
    ws.append(headers)
    for r in rows:
        ws.append([
            r["full_name"], r["audience"], str(r["hire_date"] or ""),
            r["total_hours"], r["work_hours"], r["paid_hours"], r["overtime"], r["weekend_hours"],
        ])

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    filename = f"worktrack_{s}_{e}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
