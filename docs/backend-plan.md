# План реализации бэкенда по спринтам

> Статус: Спринт 0 (фундамент) выполнен — коммит `41087ee` в `rewrite/fastapi`.
> Дизайн-система для будущего фронта: [mtuci-brandbook.md](./mtuci-brandbook.md).

## Воркфлоу каждого спринта

Фиксированный цикл — см. [workflow.md](./workflow.md):
реализация (TDD) → pytest зелёный → код-ревью → один коммит → стоп до команды «дальше».

Инфраструктура тестов: `pytest` + `httpx` (TestClient FastAPI), тестовая БД —
отдельная схема/база Postgres из docker-compose (не SQLite: поведение DATE/TZ должно
совпадать с продом).

---

## Спринт B1 — Аутентификация и пользователи

**API:**
- `POST /api/auth/register` — ФИО, email, пароль → пользователь с `is_approved=false`
- `POST /api/auth/login` — JWT (id, role, audience); неодобренному — токен с
  доступом только к `/me` (фронт покажет «ожидайте одобрения»)
- `GET /api/auth/me`
- Зависимости: `get_current_user`, `require_roles(...)`, `require_approved`,
  scope-фильтр по аудитории (worker — сам; leader — своя аудитория; admin — все)

**Тесты:** регистрация → логин → 403 до одобрения → одобрение → доступ;
дубликат email; неверный пароль; протухший/битый токен; worker не видит чужое.

**Готово когда:** полный цикл проходит в pytest и руками через `/docs`.

## Спринт B2 — Отметки, геозона, табель (ядро)

**Сервисы (TDD, чистые функции):**
- `services/geo.py` — haversine, `is_out_of_zone(lat, lng, settings)`
- `services/timesheet.py` — расчёт за период: totalHours (факт), workHours
  (рабочие дни × 9), paidHours (× 8), overtime (Σ max(0, факт−9) по будням),
  weekendHours (сб/вс/праздники отдельно, в переработку не входят).
  Рабочие дни: будни − праздники, от max(start, hire_date). Открытая смена
  в часы не входит. Все вычисления в APP_TZ, хранение UTC.

**API:**
- `POST /api/attendance/check-in` (lat/lng обязательны; одна открытая запись;
  повторный приход в тот же день — только через ручной запрос)
- `POST /api/attendance/check-out`
- `GET /api/attendance/status` — открытая смена сейчас
- `GET /api/attendance/timesheet?start&end` (+ `/timesheet/{userId}` для leader/admin)
- `GET/POST/DELETE /api/holidays` (admin)

**Тесты (граничные случаи обязательны):** переработка ровно 9ч/9ч+1мин; работа в
субботу и в праздник; hire_date в середине периода; открытая смена; двойной
check-in; check-out без check-in; отметка вне радиуса → флаг `out_of_zone`,
но запись создаётся; смена через полночь.

## Спринт B3 — Ручные запросы (WorkRequest)

**API:**
- `POST /api/requests` — валидация: дата сегодня ⇒ `check_out` пуст (запись
  останется открытой и закроется обычным check-out); прошлая дата ⇒ `check_out`
  обязателен; `check_in < check_out`; будущее — запрещено
- `GET /api/requests/my`
- `GET /api/requests/pending` (leader — своя аудитория, admin — все)
- `POST /api/requests/{id}/approve` / `reject` (+ комментарий ревьюера) —
  approve создаёт/обновляет `AttendanceRecord` с `is_manual=true`

**Тесты:** оба сценария (сегодня/прошлое) до появления в табеле; leader чужой
аудитории получает 403; повторная обработка обработанного запроса — 409/400;
approve поверх существующей записи за тот же день.

## Спринт B4 — Админка, отчёты, рейтинг, экспорт

**API:**
- Пользователи: `GET /api/admin/users` (фильтр по аудитории), `PATCH` (роль,
  аудитория, hire_date, одобрение), `DELETE` (деактивация)
- Отметки: `GET /api/admin/records` (фильтры: сотрудник/аудитория/даты),
  `PATCH /api/admin/records/{id}` (время, комментарий), `DELETE`
- `GET /api/admin/now-working` — кто сейчас на работе
- `GET /api/reports/summary?start&end&audience` — сводный табель по сотрудникам
- `GET /api/reports/rating?start&end` — score = overtime×2 + hours×0.1 − lateness×3
  (опоздание = check-in позже 9:00 в будни; веса — константы)
- `GET /api/reports/export.xlsx` — openpyxl (добавится в requirements в этом спринте)
- `GET/PUT /api/admin/settings` — координаты и радиус геозоны

**Тесты:** права на каждый admin-эндпоинт для трёх ролей; редактирование записи
меняет цифры табеля; рейтинг сортируется по score; xlsx открывается и суммы
совпадают с `/reports/summary`.

---

## После бэкенда — фронтенд (справочно, детализируем позже)

- **F1** — тема Mantine по [mtuci-brandbook.md](./mtuci-brandbook.md), auth-экраны,
  layout (шапка с логотипом, сайдбар админки)
- **F2** — экраны работника: CheckIn (гео), Timesheet, Requests
- **F3** — админка: Dashboard, Employees, Records, Requests review, Holidays,
  Rating, Reports + Excel; полировка, мобильная приёмка 375px

Тот же воркфлоу: спринт → проверка в браузере → код-ревью → коммит → «дальше».
