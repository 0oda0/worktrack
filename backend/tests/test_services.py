from datetime import date, datetime, timezone

from app.services.geo import haversine_m, is_out_of_zone
from app.services.timesheet import compute_stats, count_working_days


def dt(y, m, d, hh, mm=0):
    return datetime(y, m, d, hh, mm, tzinfo=timezone.utc)


# ---- geo ----

def test_haversine_zero_distance():
    assert haversine_m(55.75, 37.61, 55.75, 37.61) == 0


def test_haversine_one_degree_lat_is_about_111km():
    d = haversine_m(0, 0, 1, 0)
    assert 110_000 < d < 112_000


def test_in_and_out_of_zone():
    office = (55.7558, 37.6173)  # центр круга
    # ~15 м в сторону — внутри радиуса 200 м (полигон не задан → круг)
    assert is_out_of_zone(55.7559, 37.6173, None, *office, 200) is False
    # ~1 км — снаружи
    assert is_out_of_zone(55.7648, 37.6173, None, *office, 200) is True


# ---- count_working_days ----

def test_working_days_full_week():
    # пн 2026-06-01 .. вс 2026-06-07 → 5 будней
    assert count_working_days(date(2026, 6, 1), date(2026, 6, 7), set()) == 5


def test_working_days_excludes_holiday():
    assert count_working_days(date(2026, 6, 1), date(2026, 6, 7), {date(2026, 6, 3)}) == 4


def test_working_days_empty_when_end_before_start():
    assert count_working_days(date(2026, 6, 7), date(2026, 6, 1), set()) == 0


# ---- compute_stats ----

def test_overtime_boundary_exactly_9h_no_overtime():
    recs = [(date(2026, 6, 1), dt(2026, 6, 1, 9), dt(2026, 6, 1, 18))]  # 9ч ровно
    s = compute_stats(recs, set(), None, date(2026, 6, 1), date(2026, 6, 1))
    assert s.total_hours == 9
    assert s.overtime == 0


def test_overtime_over_9h():
    recs = [(date(2026, 6, 1), dt(2026, 6, 1, 9), dt(2026, 6, 1, 19))]  # 10ч
    s = compute_stats(recs, set(), None, date(2026, 6, 1), date(2026, 6, 1))
    assert s.overtime == 1
    assert s.weekend_hours == 0


def test_weekend_hours_separate_no_overtime():
    # 2026-06-06 — суббота, 10ч → всё в weekend, overtime не начисляется
    recs = [(date(2026, 6, 6), dt(2026, 6, 6, 9), dt(2026, 6, 6, 19))]
    s = compute_stats(recs, set(), None, date(2026, 6, 6), date(2026, 6, 6))
    assert s.weekend_hours == 10
    assert s.overtime == 0
    assert s.total_hours == 10


def test_holiday_counts_as_weekend():
    hol = {date(2026, 6, 3)}  # среда-праздник
    recs = [(date(2026, 6, 3), dt(2026, 6, 3, 9), dt(2026, 6, 3, 19))]
    s = compute_stats(recs, hol, None, date(2026, 6, 3), date(2026, 6, 3))
    assert s.weekend_hours == 10
    assert s.overtime == 0


def test_open_shift_not_counted():
    recs = [(date(2026, 6, 1), dt(2026, 6, 1, 9), None)]
    s = compute_stats(recs, set(), None, date(2026, 6, 1), date(2026, 6, 1))
    assert s.total_hours == 0


def test_hire_date_midperiod_reduces_norm():
    # период пн-пт (5 будней), но нанят в среду → норма считается с среды = 3 будня
    s = compute_stats([], set(), date(2026, 6, 3), date(2026, 6, 1), date(2026, 6, 5))
    assert s.work_hours == 27  # 3 × 9
    assert s.paid_hours == 24  # 3 × 8


def test_norm_over_full_week():
    s = compute_stats([], set(), None, date(2026, 6, 1), date(2026, 6, 7))
    assert s.work_hours == 45  # 5 × 9
    assert s.paid_hours == 40  # 5 × 8
