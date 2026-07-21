#!/usr/bin/env bash
# Выкатка на сервере: подтянуть main, пересобрать контейнеры, проверить здоровье.
# Запускается по SSH из .github/workflows/deploy.yml, но можно и руками:
#   cd /opt/worktrack && ./deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
echo "▶ Каталог: $(pwd)"

if [ ! -f .env ]; then
  echo "✖ Нет .env — скопируйте .env.example и заполните секреты (docs/deployment.md)" >&2
  exit 1
fi

echo "▶ Обновляю код из origin/main"
git fetch --prune origin
git checkout main
git reset --hard origin/main
echo "  на коммите: $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"

echo "▶ Пересобираю и поднимаю контейнеры"
docker compose up -d --build --remove-orphans

echo "▶ Жду, пока бэкенд ответит на /api/health"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
    echo "  бэкенд жив"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "✖ Бэкенд не поднялся за 60 секунд. Логи:" >&2
    docker compose logs --tail 50 backend >&2
    exit 1
  fi
  sleep 2
done

echo "▶ Проверяю фронтенд"
curl -fsS -o /dev/null http://127.0.0.1:3000/ && echo "  фронтенд отдаётся"

echo "▶ Чищу старые образы"
docker image prune -f >/dev/null

docker compose ps
echo "✔ Деплой завершён"
