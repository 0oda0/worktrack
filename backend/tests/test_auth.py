"""Спринт B1 — регистрация, логин, одобрение, права доступа."""


def register(client, email="ivan@mtuci.ru", password="secret1", name="Иван"):
    return client.post(
        "/api/auth/register",
        json={"full_name": name, "email": email, "password": password},
    )


def login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def admin_token(client):
    # админ засеян lifespan-ом из ADMIN_EMAIL/ADMIN_PASSWORD (дефолт admin@worktrack.local/admin)
    r = login(client, "admin@worktrack.ru", "admin")
    assert r.status_code == 200, r.text
    return r.json()["token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_creates_unapproved_user(client):
    r = register(client)
    assert r.status_code == 201
    body = r.json()
    assert body["is_approved"] is False
    assert body["role"] == "worker"
    assert "password" not in body


def test_duplicate_email_rejected(client):
    register(client)
    r = register(client)
    assert r.status_code == 409


def test_login_wrong_password(client):
    register(client)
    assert login(client, "ivan@mtuci.ru", "wrong").status_code == 401


def test_unapproved_can_login_and_see_me_only(client):
    register(client)
    tok = login(client, "ivan@mtuci.ru", "secret1").json()["token"]

    me = client.get("/api/auth/me", headers=auth(tok))
    assert me.status_code == 200
    assert me.json()["email"] == "ivan@mtuci.ru"

    # защищённый ролью эндпоинт закрыт до одобрения
    assert client.get("/api/admin/users/pending", headers=auth(tok)).status_code == 403


def test_bad_token_rejected(client):
    assert client.get("/api/auth/me", headers=auth("garbage")).status_code == 401
    assert client.get("/api/auth/me").status_code == 403  # нет заголовка → HTTPBearer 403


def test_admin_approves_worker_then_access_granted(client):
    reg = register(client)
    uid = reg.json()["id"]
    atok = admin_token(client)

    # до одобрения — в списке ожидания
    pending = client.get("/api/admin/users/pending", headers=auth(atok))
    assert uid in [u["id"] for u in pending.json()]

    r = client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(atok),
        json={"role": "worker", "audience": "203", "hire_date": "2026-01-15"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["is_approved"] is True
    assert r.json()["audience"] == "203"


def test_approve_requires_audience_for_non_admin(client):
    uid = register(client).json()["id"]
    atok = admin_token(client)
    r = client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(atok),
        json={"role": "worker", "hire_date": "2026-01-15"},
    )
    assert r.status_code == 422


def test_cannot_reapprove_already_approved(client):
    uid = register(client).json()["id"]
    atok = admin_token(client)
    body = {"role": "worker", "audience": "203", "hire_date": "2026-01-15"}
    client.post(f"/api/admin/users/{uid}/approve", headers=auth(atok), json=body)
    r = client.post(f"/api/admin/users/{uid}/approve", headers=auth(atok), json=body)
    assert r.status_code == 409


def test_approve_rejects_bad_role(client):
    uid = register(client).json()["id"]
    atok = admin_token(client)
    r = client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(atok),
        json={"role": "adminX", "audience": "203", "hire_date": "2026-01-15"},
    )
    assert r.status_code == 422


def test_worker_cannot_approve(client):
    uid = register(client).json()["id"]
    atok = admin_token(client)
    client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(atok),
        json={"role": "worker", "audience": "203", "hire_date": "2026-01-15"},
    )
    wtok = login(client, "ivan@mtuci.ru", "secret1").json()["token"]
    # одобренный worker всё равно не админ
    r = client.post(
        f"/api/admin/users/{uid}/approve",
        headers=auth(wtok),
        json={"role": "worker", "audience": "903", "hire_date": "2026-01-15"},
    )
    assert r.status_code == 403
