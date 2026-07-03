#!/usr/bin/env bash
# Full cPanel deploy for cmsr.in — run from project root (~/cmsr)
# Usage:
#   cd ~/cmsr && git pull origin laravel && \
#   DEPLOY_DB_PASSWORD='your-password' bash scripts/cpanel-deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="${DEPLOY_APP_NAME:-GramUnnati}"
APP_URL="${DEPLOY_APP_URL:-https://cmsr.in}"
DB_HOST="${DEPLOY_DB_HOST:-localhost}"
DB_PORT="${DEPLOY_DB_PORT:-3306}"
DB_DATABASE="${DEPLOY_DB_DATABASE:-cmsr_db}"
DB_USERNAME="${DEPLOY_DB_USERNAME:-cmsr_db}"
DB_PASSWORD="${DEPLOY_DB_PASSWORD:-}"
SESSION_DOMAIN="${DEPLOY_SESSION_DOMAIN:-.cmsr.in}"
SANCTUM_DOMAINS="${DEPLOY_SANCTUM_DOMAINS:-cmsr.in,www.cmsr.in}"
MAIL_HOST="${DEPLOY_MAIL_HOST:-mail.cmsr.in}"
MAIL_USER="${DEPLOY_MAIL_USER:-noreply@cmsr.in}"
MARK_MIGRATIONS="${DEPLOY_MARK_MIGRATIONS:-1}"
LINK_PUBLIC_HTML="${DEPLOY_LINK_PUBLIC_HTML:-0}"

echo "==> GramUnnati deploy in $ROOT"

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: Set DEPLOY_DB_PASSWORD before running."
  echo "Example: DEPLOY_DB_PASSWORD='secret' bash scripts/cpanel-deploy.sh"
  exit 1
fi

echo "==> Pull latest code (if git repo)"
if [ -d .git ]; then
  git fetch origin 2>/dev/null || true
  git pull origin laravel 2>/dev/null || git pull 2>/dev/null || true
fi

echo "==> Write .env"
cat > .env <<ENVFILE
APP_NAME=${APP_NAME}
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=${APP_URL}

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD="${DB_PASSWORD}"

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=${SESSION_DOMAIN}

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

SANCTUM_STATEFUL_DOMAINS=${SANCTUM_DOMAINS}

MAIL_MAILER=smtp
MAIL_HOST=${MAIL_HOST}
MAIL_PORT=465
MAIL_USERNAME=${MAIL_USER}
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=${MAIL_USER}
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
ENVFILE

echo "==> Composer install"
if command -v composer >/dev/null 2>&1; then
  composer install --optimize-autoloader --no-dev --no-interaction
elif [ -x "$HOME/bin/composer" ]; then
  "$HOME/bin/composer" install --optimize-autoloader --no-dev --no-interaction
elif [ -f composer.phar ]; then
  php composer.phar install --optimize-autoloader --no-dev --no-interaction
else
  echo "==> Installing Composer locally..."
  curl -sS https://getcomposer.org/installer | php
  php composer.phar install --optimize-autoloader --no-dev --no-interaction
fi

echo "==> Laravel setup"
php artisan key:generate --force

if [ "$MARK_MIGRATIONS" = "1" ]; then
  php artisan gramunnati:mark-migrations-run || true
else
  php artisan migrate --force
fi

php artisan storage:link 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "$LINK_PUBLIC_HTML" = "1" ] && [ -d "$HOME/public_html" ]; then
  echo "==> Link public_html -> public (only if domain uses ~/public_html)"
  ln -sfn "$ROOT/public" "$HOME/public_html"
fi

echo ""
echo "=============================================="
echo " DEPLOY FINISHED"
echo "=============================================="
echo " Site:    ${APP_URL}/"
echo " Health:  ${APP_URL}/up"
echo " API:     ${APP_URL}/api/health"
echo " Admin:   ${APP_URL}/admin"
echo ""
echo " If the site does not load, set document root in cPanel to:"
echo "   ${ROOT}/public"
echo ""
echo " Or re-run with public_html link:"
echo "   DEPLOY_LINK_PUBLIC_HTML=1 DEPLOY_DB_PASSWORD='...' bash scripts/cpanel-deploy.sh"
echo "=============================================="
