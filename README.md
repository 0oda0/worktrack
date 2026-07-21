# WorkTrack

Веб-приложение для учёта рабочего времени сотрудников МТУСИ: отметка прихода/ухода
с проверкой геолокации, автоматический табель с нормами и переработками, ручные
заявки на исправление отметок с одобрением руководителем, отчёты в Excel, рейтинг
сотрудников. Переписано с нуля на FastAPI + React вместо предыдущей реализации.

## Возможности

- **Отметка прихода/ухода.** Приход проверяется по геозоне (полигон территории
  или круг «точка + радиус» как запасной вариант); уход геолокацию не требует.
  Отметка вне зоны сохраняется с пометкой для администратора, а не блокируется.
- **Табель.** Норма 9ч/8ч в день, переработки, часы в выходные и праздники,
  группировка нескольких смен за один день, поддержка ночных смен (уход на
  следующие сутки).
- **Ручные заявки.** Сотрудник может запросить отметку задним числом (например,
  забыл отметиться) — заявка попадает на одобрение старшему составу/админу.
- **Роли.** `admin` (полный доступ, включая настройки геозоны и сотрудников),
  `leader` (старший состав — отметки/заявки/отчёты своей аудитории плюс личная
  отметка), `worker` (отметка, свой табель, свои заявки).
- **Аудитории.** Сотрудники группируются по аудиториям `203` / `903` / `906`;
  отчёты и списки фильтруются по ним.
- **Отчёты и рейтинг.** Сводка часов за период, экспорт в Excel (`.xlsx`,
  формат под существующий шаблон отчёта), рейтинг по переработкам/опозданиям.
- **Дашборд.** Кто сейчас на работе, часы за месяц по сотрудникам, заявки на
  рассмотрении.

## Стек

**Backend**
- Python 3.12, [FastAPI](https://fastapi.tiangolo.com/) 0.115
- SQLAlchemy 2.0 (sync) + PostgreSQL 16, миграции — Alembic 1.14
- Pydantic v2 / pydantic-settings — валидация и конфиг
- JWT (PyJWT) для аутентификации, bcrypt для паролей
- openpyxl — генерация Excel-отчётов
- pytest + httpx — тесты (71+ тестов, отдельная тестовая БД)

**Frontend**
- React 19 + TypeScript, Vite 8 (rolldown)
- [Mantine](https://mantine.dev/) v9 — UI-кит (core, dates, form, notifications, modals)
- TanStack Query v5 — серверное состояние и кэш
- React Router 7, axios, dayjs (локаль `ru`), Recharts — графики

**Инфраструктура**
- Docker Compose: `db` (Postgres) + `backend` (Uvicorn) + `frontend` (статика на nginx)
- Хранение времени: UTC в БД, отображение — по таймзоне `APP_TZ` (по умолчанию
  `Europe/Moscow`)

## Быстрый запуск (Docker)

```bash
git clone git@github.com:0oda0/worktrack.git
cd worktrack
cp .env.example .env    # заполнить секреты, см. таблицу ниже
docker compose up --build
```

- Приложение: http://localhost:3000
- API напрямую: http://localhost:8000/api, интерактивная документация —
  http://localhost:8000/docs
- Первый администратор создаётся автоматически при старте из `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` (идемпотентно — повторные запуски его не дублируют).

Миграции (`alembic upgrade head`) применяются автоматически при старте
контейнера `backend`.

## Разработка без Docker

Требуется локальный PostgreSQL 16.

```bash
# backend
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # или задать переменные окружения напрямую
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000

# frontend (в отдельном терминале; dev-сервер проксирует /api на :8000)
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Тесты и линт

```bash
# backend — отдельная БД worktrack_test создаётся автоматически
cd backend && pytest

# frontend
cd frontend
npm run lint     # oxlint
npm run build    # tsc -b && vite build — проверка типов и сборки
```

## Переменные окружения

Заполняются в `.env` (см. `.env.example`):

| Переменная | Назначение | По умолчанию |
|---|---|---|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Доступ к PostgreSQL | `worktrack` / — / `worktrack` |
| `DB_HOST`, `DB_PORT` | Хост/порт БД (в Docker — `db`) | `db` / `5432` |
| `JWT_SECRET` | Секрет подписи JWT — обязательно сменить в проде | — |
| `APP_TZ` | Таймзона отображения времени (IANA) | `Europe/Moscow` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Учётка первого администратора | `admin@worktrack.ru` / — |
| `OFFICE_LAT`, `OFFICE_LNG`, `OFFICE_RADIUS_M` | Геозона по умолчанию (круг), если полигон не задан | Москва, 200 м |

Полигон рабочей зоны задаётся отдельно через админку (Настройки →
GeoJSON-полигон) и хранится в таблице `settings`, а не в `.env`.

## Структура проекта

```
worktrack/
├── backend/
│   ├── app/
│   │   ├── routers/       # auth, admin, attendance, holidays, requests, reports
│   │   ├── services/      # geo (полигон/круг), timesheet, reports (Excel), settings_store
│   │   ├── models.py      # SQLAlchemy-модели
│   │   ├── schemas.py     # Pydantic-схемы запросов/ответов
│   │   └── seed.py        # первый админ + дефолтная геозона
│   ├── alembic/           # миграции БД
│   └── tests/             # pytest
├── frontend/
│   └── src/
│       ├── pages/worker/  # отметка, табель, заявки — мобильный интерфейс работника
│       ├── pages/admin/   # дашборд, отметки, заявки, отчёты, рейтинг, сотрудники, настройки
│       ├── layouts/       # WorkerShell (мобильный), AdminShell (десктоп)
│       ├── api/           # запросы к бэкенду (axios + TanStack Query)
│       └── components/
├── docs/                  # брендбук МТУСИ, план бэкенда, описание процесса
└── docker-compose.yml
```

## API

Основные группы эндпоинтов (полная схема — `/docs`):

- `POST /api/auth/register`, `/api/auth/login`, `GET /api/auth/me`
- `POST /api/attendance/check-in`, `POST /api/attendance/check-out`,
  `GET /api/attendance/timesheet`
- `GET/POST /api/requests`, `POST /api/requests/{id}/approve|reject`
- `GET/PATCH /api/admin/users`, `GET/PATCH/DELETE /api/admin/records`,
  `GET /api/admin/now-working`, `GET/PUT /api/admin/settings`
- `GET /api/reports/summary`, `GET /api/reports/rating`,
  `GET /api/reports/export.xlsx`
- `GET/POST/DELETE /api/holidays`

Аутентификация — `Authorization: Bearer <JWT>`, токен выдаётся `/api/auth/login`.

## Роли и доступ

| Роль | Отметка | Свой табель/заявки | Отметки/заявки других | Сотрудники, настройки, праздники |
|---|---|---|---|---|
| `worker` | ✅ | ✅ | — | — |
| `leader` | ✅ | ✅ | ✅ (своя аудитория) | — |
| `admin` | ✅ | ✅ | ✅ (все) | ✅ |

Новые пользователи регистрируются самостоятельно и попадают в статус
«на одобрении» до тех пор, пока администратор не назначит роль и аудиторию.
