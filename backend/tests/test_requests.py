"""Спринт B3 — ручные запросы (WorkRequest)."""

from datetime import date, timedelta

IN_ZONE = {"lat": 55.7558, "lng": 37.6173}


def register(client, email, name="U"):
    return client.post(
        "/api/auth/register", json={"full_name": name, "email": email, "password": "secret1"}
    )


def login(client, email):
    return client.post(
        "/api/auth/login", json={"email": email, "password": "secret1"}
    ).json()["token"]


def auth(t):
    return {"Authorization": f"Bearer {t}"}


def admin_token(client):
    return client.post(
        "/api/auth/login", json={"email": "admin@worktrack.ru", "password": "admin"}
    ).json()["token"]


def approve_user(client, email, role="worker", audience="203"):
    uid = register(client, email).json()["id"]
    client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(admin_token(client)),
        json={"role": role, "audience": audience, "hire_date": "2026-01-01"},
    )
    return uid, login(client, email)


def past_date():
    d = date.today() - timedelta(days=3)
    return d.isoformat()


# ---- создание и валидация ----

def test_past_request_requires_checkout(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    r = client.post(
        "/api/requests",
        headers=auth(tok),
        json={"work_date": past_date(), "check_in": f"{past_date()}T09:00:00"},
    )
    assert r.status_code == 422


def test_today_request_rejects_checkout(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    today = date.today().isoformat()
    r = client.post(
        "/api/requests",
        headers=auth(tok),
        json={
            "work_date": today,
            "check_in": f"{today}T09:00:00",
            "check_out": f"{today}T18:00:00",
        },
    )
    assert r.status_code == 422


def test_future_date_rejected(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    future = (date.today() + timedelta(days=1)).isoformat()
    r = client.post(
        "/api/requests",
        headers=auth(tok),
        json={"work_date": future, "check_in": f"{future}T09:00:00"},
    )
    assert r.status_code == 422


def test_checkin_after_checkout_rejected(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    pd = past_date()
    r = client.post(
        "/api/requests",
        headers=auth(tok),
        json={"work_date": pd, "check_in": f"{pd}T18:00:00", "check_out": f"{pd}T09:00:00"},
    )
    assert r.status_code == 422


# ---- сценарий: прошлый день → одобрение → в табеле ----

def test_past_request_approved_appears_in_timesheet(client):
    uid, tok = approve_user(client, "w@mtuci.ru")
    _, ltok = approve_user(client, "lead@mtuci.ru", role="leader")
    pd = past_date()
    req = client.post(
        "/api/requests",
        headers=auth(tok),
        json={"work_date": pd, "check_in": f"{pd}T09:00:00", "check_out": f"{pd}T17:00:00"},
    ).json()

    ap = client.post(f"/api/requests/{req['id']}/approve", headers=auth(ltok), json={"comment": "ок"})
    assert ap.status_code == 200
    assert ap.json()["status"] == "approved"

    ts = client.get(
        f"/api/attendance/timesheet?start={pd}&end={pd}", headers=auth(tok)
    ).json()
    assert len(ts["days"]) == 1
    assert ts["days"][0]["is_manual"] is True
    assert ts["days"][0]["hours"] == 8.0


# ---- сценарий: сегодня → одобрение → открытая смена → закрывается check-out ----

def test_today_request_creates_open_shift_closed_by_checkout(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    atok = admin_token(client)
    today = date.today().isoformat()
    req = client.post(
        "/api/requests",
        headers=auth(tok),
        json={"work_date": today, "check_in": f"{today}T09:00:00"},
    ).json()

    client.post(f"/api/requests/{req['id']}/approve", headers=auth(atok), json={})

    # смена открыта
    st = client.get("/api/attendance/status", headers=auth(tok))
    assert st.json() is not None and st.json()["check_out"] is None

    # закрывается обычным check-out
    out = client.post("/api/attendance/check-out", headers=auth(tok), json=IN_ZONE)
    assert out.status_code == 200
    assert out.json()["check_out"] is not None


def test_approve_today_blocked_if_open_shift_exists(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    atok = admin_token(client)
    # живая отметка → открытая смена
    client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    today = date.today().isoformat()
    req = client.post(
        "/api/requests", headers=auth(tok),
        json={"work_date": today, "check_in": f"{today}T09:00:00"},
    ).json()
    r = client.post(f"/api/requests/{req['id']}/approve", headers=auth(atok), json={})
    assert r.status_code == 409


# ---- права и статусы ----

def test_leader_reviews_any_audience(client):
    _, tok = approve_user(client, "w903@mtuci.ru", audience="903")
    _, ltok = approve_user(client, "lead203@mtuci.ru", role="leader", audience="203")
    pd = past_date()
    req = client.post(
        "/api/requests", headers=auth(tok),
        json={"work_date": pd, "check_in": f"{pd}T09:00:00", "check_out": f"{pd}T17:00:00"},
    ).json()
    r = client.post(f"/api/requests/{req['id']}/approve", headers=auth(ltok), json={})
    assert r.status_code == 200  # лидер управляет всеми аудиториями


def test_worker_cannot_list_pending(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    assert client.get("/api/requests/pending", headers=auth(tok)).status_code == 403


def test_double_process_rejected(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    atok = admin_token(client)
    pd = past_date()
    req = client.post(
        "/api/requests", headers=auth(tok),
        json={"work_date": pd, "check_in": f"{pd}T09:00:00", "check_out": f"{pd}T17:00:00"},
    ).json()
    client.post(f"/api/requests/{req['id']}/approve", headers=auth(atok), json={})
    r = client.post(f"/api/requests/{req['id']}/reject", headers=auth(atok), json={})
    assert r.status_code == 409


def test_my_requests_lists_own(client):
    _, tok = approve_user(client, "w@mtuci.ru")
    pd = past_date()
    client.post(
        "/api/requests", headers=auth(tok),
        json={"work_date": pd, "check_in": f"{pd}T09:00:00", "check_out": f"{pd}T17:00:00"},
    )
    mine = client.get("/api/requests/my", headers=auth(tok)).json()
    assert len(mine) == 1 and mine[0]["status"] == "pending"


def test_leader_pending_sees_all_and_audience_filter(client):
    _, w203 = approve_user(client, "w203@mtuci.ru", audience="203")
    _, w903 = approve_user(client, "w903@mtuci.ru", audience="903")
    _, ltok = approve_user(client, "lead@mtuci.ru", role="leader", audience="203")
    pd = past_date()
    for tok in (w203, w903):
        client.post(
            "/api/requests", headers=auth(tok),
            json={"work_date": pd, "check_in": f"{pd}T09:00:00", "check_out": f"{pd}T17:00:00"},
        )
    pending = client.get("/api/requests/pending", headers=auth(ltok)).json()
    assert len(pending) == 2  # лидер видит все аудитории
    filtered = client.get("/api/requests/pending?audience=903", headers=auth(ltok)).json()
    assert len(filtered) == 1  # фильтр по аудитории
