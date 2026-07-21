# Деплой и ветки

## Как устроены ветки

| Ветка | Назначение |
|---|---|
| `main` | Продакшн. Любой пуш сюда автоматически выкатывается на сервер. |
| `dev` | Основная рабочая ветка: сюда сливается вся разработка. |
| `feature/*`, `fix/*` | Ветки под конкретную задачу, отпочковываются от `dev`. |

Рабочий цикл:

```bash
git checkout dev && git pull
git checkout -b feature/название      # делаем задачу
# ... коммиты ...
git push -u origin feature/название   # PR в dev, CI гоняет тесты
```

Когда в `dev` накопилось готовое к релизу — сливаем в `main`:

```bash
git checkout main && git pull
git merge --ff-only dev
git push origin main                  # → CI → автодеплой на сервер
```

После релиза `dev` и `main` совпадают. Хотфикс можно вливать в `main`
напрямую, но потом обязательно вернуть его в `dev` (`git checkout dev &&
git merge main`), иначе следующий релиз откатит фикс.

## Что происходит при пуше

- **Пуш в `dev` или PR** → workflow `CI`: pytest на бэкенде (с реальным
  Postgres) + линт и сборка фронтенда.
- **Пуш в `main`** → workflow `Deploy`: сначала те же тесты, затем, если они
  зелёные, подключение по SSH к серверу и запуск `deploy/deploy.sh`.

Пока сервер не заведён, секрет `DEPLOY_HOST` пуст — деплой отработает и
напишет в лог «сервер ещё не подключён», прогон останется зелёным. Как только
секреты добавят, выкатка начнёт работать сама, менять код не нужно.

## Подготовка сервера (когда он появится)

Нужен Linux-сервер (Ubuntu 22.04+) с публичным IP и доменом.

### 1. Docker и код

```bash
# на сервере, под root или через sudo
curl -fsSL https://get.docker.com | sh

mkdir -p /opt/worktrack && cd /opt/worktrack
git clone git@github.com:0oda0/worktrack.git .
git checkout main
```

Серверу нужен доступ к репозиторию на чтение: сгенерируйте на нём ключ
(`ssh-keygen -t ed25519`) и добавьте публичную часть в GitHub как Deploy key.

### 2. Переменные окружения

```bash
cp .env.example .env
nano .env   # обязательно: JWT_SECRET, DB_PASSWORD, ADMIN_PASSWORD — длинные случайные
```

Сгенерировать секрет: `openssl rand -hex 32`.

### 3. Первый запуск

```bash
./deploy/deploy.sh
```

Скрипт подтянет `main`, соберёт образы, поднимет контейнеры, дождётся ответа
`/api/health` и покажет статус. Миграции применяются автоматически при старте
бэкенда.

### 4. HTTPS — обязательно

**Геолокация в браузере работает только по HTTPS** (кроме `localhost`). Без
сертификата кнопка «Пришёл» не сможет получить координаты. Поднимите перед
контейнерами nginx/Caddy с Let's Encrypt:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d worktrack.example.ru
```

Reverse-proxy должен направлять `/` на `127.0.0.1:3000`, а `/api` —
на `127.0.0.1:8000`.

Порт 5432 в `docker-compose.yml` проброшен наружу для удобства разработки —
на сервере его стоит закрыть файрволом (`ufw deny 5432`) или убрать из
`ports`.

### 5. Секреты GitHub

`Settings → Secrets and variables → Actions → New repository secret`:

| Секрет | Что класть | Обязательный |
|---|---|---|
| `DEPLOY_HOST` | IP или домен сервера | да |
| `DEPLOY_USER` | пользователь для SSH (например `deploy` или `root`) | да |
| `DEPLOY_SSH_KEY` | **приватный** ключ целиком, включая строки `BEGIN`/`END` | да |
| `DEPLOY_PORT` | порт SSH, если не 22 | нет |
| `DEPLOY_PATH` | путь к репозиторию на сервере, по умолчанию `/opt/worktrack` | нет |
| `DEPLOY_KNOWN_HOSTS` | вывод `ssh-keyscan <host>`, чтобы не доверять ключу вслепую | нет, но желательно |

Ключ для деплоя лучше завести отдельный:

```bash
# локально
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/worktrack_deploy
ssh-copy-id -i ~/.ssh/worktrack_deploy.pub deploy@СЕРВЕР
cat ~/.ssh/worktrack_deploy        # это содержимое → в секрет DEPLOY_SSH_KEY
ssh-keyscan СЕРВЕР                 # → в секрет DEPLOY_KNOWN_HOSTS
```

### 6. Проверка

Запустите workflow `Deploy` вручную: вкладка **Actions → Deploy → Run
workflow**. Если всё настроено, в логе появится статус контейнеров и
«Деплой завершён».

## Откат

```bash
# на сервере
cd /opt/worktrack
git reset --hard <хороший-коммит>
docker compose up -d --build
```

Или через GitHub: `git revert` проблемного коммита в `main` и пуш — деплой
поедет автоматически.

## Резервные копии БД

Данные лежат в docker-томе `postgres_data`. Простой бэкап по расписанию:

```bash
docker compose exec -T db pg_dump -U worktrack worktrack | gzip > /backup/worktrack-$(date +%F).sql.gz
```

Восстановление:

```bash
gunzip -c /backup/worktrack-2026-07-21.sql.gz | docker compose exec -T db psql -U worktrack -d worktrack
```
