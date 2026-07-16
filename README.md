# WorkTrack

Учёт рабочего времени с геолокацией: отметки прихода/ухода, табель (нормы 9ч/8ч,
переработки, часы выходных), ручные запросы с одобрением, роли
(админ / старший состав / работник), аудитории 203/903/906, отчёты и рейтинги.

## Стек

- **Backend**: FastAPI + SQLAlchemy 2.0 + PostgreSQL, Alembic, JWT
- **Frontend**: React + TypeScript + Vite, Mantine, TanStack Query
- **Deploy**: docker-compose (db + backend + frontend/nginx)

## Запуск

```bash
cp .env.example .env   # заполнить секреты
docker compose up --build
```

- Приложение: http://localhost:3000
- API: http://localhost:3000/api (напрямую: http://localhost:8000/api)

Первый админ создаётся автоматически из `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Разработка без Docker

```bash
# backend
cd backend && pip install -r requirements.txt
alembic upgrade head && uvicorn app.main:app --reload

# frontend (проксирует /api на localhost:8000)
cd frontend && npm install && npm run dev
```
