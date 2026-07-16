"""Чистый расчёт табеля. Не зависит от БД — на вход простые данные, что удобно тестировать."""

from dataclasses import dataclass
from datetime import date, datetime, timedelta

WORK_DAY_HOURS = 9  # норма рабочих часов в день
PAID_DAY_HOURS = 8  # норма оплачиваемых часов в день

# Запись: (дата, приход, уход|None). Уход None ⇒ смена открыта, в расчёт часов не идёт.
Record = tuple[date, datetime, datetime | None]


@dataclass
class Stats:
    total_hours: float  # фактически отработано (закрытые смены)
    work_hours: float  # норма: рабочие дни × 9
    paid_hours: float  # норма: рабочие дни × 8
    overtime: float  # сверх 9ч/день в будни (выходные не считаются)
    weekend_hours: float  # часы в выходные/праздники — отдельно


def is_weekend_or_holiday(d: date, holidays: set[date]) -> bool:
    return d.weekday() >= 5 or d in holidays


def count_working_days(start: date, end: date, holidays: set[date]) -> int:
    """Будни в [start, end] за вычетом праздников."""
    if end < start:
        return 0
    count = 0
    cur = start
    while cur <= end:
        if not is_weekend_or_holiday(cur, holidays):
            count += 1
        cur += timedelta(days=1)
    return count


def _round(x: float) -> float:
    return round(x, 2)


def compute_stats(
    records: list[Record],
    holidays: set[date],
    hire_date: date | None,
    start: date,
    end: date,
) -> Stats:
    effective_start = max(start, hire_date) if hire_date else start
    working_days = count_working_days(effective_start, end, holidays)

    total = weekend = overtime = 0.0
    for work_date, check_in, check_out in records:
        if check_out is None:
            continue
        dur = (check_out - check_in).total_seconds() / 3600
        total += dur
        if is_weekend_or_holiday(work_date, holidays):
            weekend += dur
        elif dur > WORK_DAY_HOURS:
            overtime += dur - WORK_DAY_HOURS

    return Stats(
        total_hours=_round(total),
        work_hours=_round(working_days * WORK_DAY_HOURS),
        paid_hours=_round(working_days * PAID_DAY_HOURS),
        overtime=_round(overtime),
        weekend_hours=_round(weekend),
    )
