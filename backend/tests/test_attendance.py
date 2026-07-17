"""Спринт B2 — отметки, геозона, табель через API."""

# офис по дефолту: 55.7558, 37.6173, радиус 200 м
IN_ZONE = {"lat": 55.7558, "lng": 37.6173}
OUT_ZONE = {"lat": 55.7700, "lng": 37.6173}  # ~1.6 км


def register(client, email, password="secret1", name="U"):
    return client.post(
        "/api/auth/register", json={"full_name": name, "email": email, "password": password}
    )


def login(client, email, password="secret1"):
    return client.post("/api/auth/login", json={"email": email, "password": password}).json()["token"]


def auth(t):
    return {"Authorization": f"Bearer {t}"}


def admin_token(client):
    return login(client, "admin@worktrack.ru", "admin")


def approved_worker(client, email="w@mtuci.ru", audience="203", hire_date="2026-01-01"):
    uid = register(client, email).json()["id"]
    at = admin_token(client)
    client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(at),
        json={"role": "worker", "audience": audience, "hire_date": hire_date},
    )
    return uid, login(client, email)


def test_checkin_requires_geo(client):
    _, tok = approved_worker(client)
    r = client.post("/api/attendance/check-in", headers=auth(tok), json={"lat": 999, "lng": 0})
    assert r.status_code == 422


def test_checkin_in_zone(client):
    _, tok = approved_worker(client)
    r = client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    assert r.status_code == 201
    assert r.json()["out_of_zone_in"] is False
    assert r.json()["check_out"] is None


def test_checkin_out_of_zone_flagged_not_blocked(client):
    _, tok = approved_worker(client)
    r = client.post("/api/attendance/check-in", headers=auth(tok), json=OUT_ZONE)
    assert r.status_code == 201
    assert r.json()["out_of_zone_in"] is True


def test_double_checkin_rejected(client):
    _, tok = approved_worker(client)
    client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    r = client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    assert r.status_code == 409


def test_checkout_without_checkin(client):
    _, tok = approved_worker(client)
    r = client.post("/api/attendance/check-out", headers=auth(tok))
    assert r.status_code == 409


def test_checkout_needs_no_geo(client):
    _, tok = approved_worker(client)
    client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    out = client.post("/api/attendance/check-out", headers=auth(tok))  # без тела/гео
    assert out.status_code == 200
    assert out.json()["check_out"] is not None


def test_checkin_checkout_cycle_and_status(client):
    _, tok = approved_worker(client)
    client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)

    st = client.get("/api/attendance/status", headers=auth(tok))
    assert st.json() is not None and st.json()["check_out"] is None

    out = client.post("/api/attendance/check-out", headers=auth(tok))
    assert out.status_code == 200
    assert out.json()["check_out"] is not None

    # после закрытия новый check-in снова разрешён (повторный приход в тот же день)
    assert client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE).status_code == 201
    assert client.get("/api/attendance/status", headers=auth(tok)).json() is not None


def test_checkin_uses_polygon_zone(client):
    # админ задаёт полигон-квадрат вокруг центра Москвы
    at = admin_token(client)
    ring = [[37.61, 55.75], [37.62, 55.75], [37.62, 55.76], [37.61, 55.76], [37.61, 55.75]]
    r = client.put(
        "/api/admin/settings",
        headers=auth(at),
        json={"office_lat": 55.7558, "office_lng": 37.6173, "office_radius_m": 200, "office_polygon": ring},
    )
    assert r.status_code == 200 and r.json()["office_polygon"] == ring

    # приход внутри полигона — «в зоне»
    _, t_in = approved_worker(client, "poly-in@mtuci.ru")
    got_in = client.post("/api/attendance/check-in", headers=auth(t_in), json={"lat": 55.7558, "lng": 37.6173})
    assert got_in.json()["out_of_zone_in"] is False

    # приход севернее квадрата — «вне зоны»
    _, t_out = approved_worker(client, "poly-out@mtuci.ru")
    got_out = client.post("/api/attendance/check-in", headers=auth(t_out), json={"lat": 55.7700, "lng": 37.6173})
    assert got_out.json()["out_of_zone_in"] is True


def test_unapproved_cannot_checkin(client):
    register(client, "new@mtuci.ru")
    tok = login(client, "new@mtuci.ru")
    assert client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE).status_code == 403


def test_timesheet_shape(client):
    _, tok = approved_worker(client)
    client.post("/api/attendance/check-in", headers=auth(tok), json=IN_ZONE)
    client.post("/api/attendance/check-out", headers=auth(tok))
    ts = client.get("/api/attendance/timesheet", headers=auth(tok))
    assert ts.status_code == 200
    body = ts.json()
    assert set(body["stats"]) == {"total_hours", "work_hours", "paid_hours", "overtime", "weekend_hours"}
    assert len(body["days"]) == 1


# ---- доступ к чужому табелю ----

def test_worker_cannot_see_other_timesheet(client):
    uid_a, _ = approved_worker(client, "a@mtuci.ru", "203")
    _, tok_b = approved_worker(client, "b@mtuci.ru", "203")
    assert client.get(f"/api/attendance/timesheet/{uid_a}", headers=auth(tok_b)).status_code == 403


def test_leader_sees_any_audience(client):
    uid_w, _ = approved_worker(client, "w203@mtuci.ru", "203")
    uid_other, _ = approved_worker(client, "w903@mtuci.ru", "903")
    # лидер 203 управляет всеми — видит и чужую аудиторию 903
    uid_l = register(client, "lead@mtuci.ru").json()["id"]
    at = admin_token(client)
    client.post(
        f"/api/admin/users/{uid_l}/approve",
        headers=auth(at),
        json={"role": "leader", "audience": "203", "hire_date": "2026-01-01"},
    )
    tok_l = login(client, "lead@mtuci.ru")
    assert client.get(f"/api/attendance/timesheet/{uid_w}", headers=auth(tok_l)).status_code == 200
    assert client.get(f"/api/attendance/timesheet/{uid_other}", headers=auth(tok_l)).status_code == 200


def test_admin_sees_any_timesheet(client):
    uid_w, _ = approved_worker(client, "any@mtuci.ru", "906")
    at = admin_token(client)
    assert client.get(f"/api/attendance/timesheet/{uid_w}", headers=auth(at)).status_code == 200


# ---- holidays ----

def test_holidays_crud_admin_only(client):
    _, wtok = approved_worker(client)
    at = admin_token(client)

    # worker не может создавать
    assert client.post("/api/holidays", headers=auth(wtok), json={"date": "2026-06-12", "name": "День России"}).status_code == 403

    r = client.post("/api/holidays", headers=auth(at), json={"date": "2026-06-12", "name": "День России"})
    assert r.status_code == 201
    hid = r.json()["id"]

    # дубликат даты
    assert client.post("/api/holidays", headers=auth(at), json={"date": "2026-06-12", "name": "x"}).status_code == 409

    # виден всем одобренным
    assert "2026-06-12" in [h["date"] for h in client.get("/api/holidays", headers=auth(wtok)).json()]

    assert client.delete(f"/api/holidays/{hid}", headers=auth(at)).status_code == 204
