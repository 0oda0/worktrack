import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Тестовая БД — отдельная база на том же Postgres (поведение DATE/TZ как в проде)
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_NAME", "worktrack_test")

from app.config import settings  # noqa: E402
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app import models  # noqa: F401,E402  — регистрирует таблицы


def _ensure_test_db() -> None:
    admin_url = settings.database_url.rsplit("/", 1)[0] + "/postgres"
    eng = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with eng.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :n"),
            {"n": settings.db_name},
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{settings.db_name}"'))
    eng.dispose()


@pytest.fixture()
def db_session():
    _ensure_test_db()
    engine = create_engine(settings.database_url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False)

    session = TestingSession()
    app.dependency_overrides[get_db] = lambda: session
    yield session
    session.close()
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture()
def client(db_session):
    with TestClient(app) as c:
        yield c
