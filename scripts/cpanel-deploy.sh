#!/usr/bin/env bash
# Full cPanel deploy for cmsr.in — run from project root (~/cmsr)
# Usage:
#   cd ~/cmsr && DEPLOY_DB_PASSWORD='your-password' bash scripts/cpanel-deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="${DEPLOY_APP_NAME:-CMSR}"
APP_URL="${DEPLOY_APP_URL:-https://cmsr.in}"
DB_HOST="${DEPLOY_DB_HOST:-localhost}"
DB_PORT="${DEPLOY_DB_PORT:-3306}"
DB_DATABASE="${DEPLOY_DB_DATABASE:-cmsr_db}"
DB_USERNAME="${DEPLOY_DB_USERNAME:-cmsr_user}"
DB_PASSWORD="${DEPLOY_DB_PASSWORD:-}"
SESSION_DOMAIN="${DEPLOY_SESSION_DOMAIN:-.cmsr.in}"
SANCTUM_DOMAINS="${DEPLOY_SANCTUM_DOMAINS:-cmsr.in,www.cmsr.in}"
MAIL_HOST="${DEPLOY_MAIL_HOST:-mail.cmsr.in}"
MAIL_USER="${DEPLOY_MAIL_USER:-noreply@cmsr.in}"
MARK_MIGRATIONS="${DEPLOY_MARK_MIGRATIONS:-0}"
LINK_PUBLIC_HTML="${DEPLOY_LINK_PUBLIC_HTML:-1}"

php_ok() {
  local bin="$1"
  [ -n "$bin" ] || return 1
  [ -x "$bin" ] || command -v "$bin" >/dev/null 2>&1 || return 1
  "$bin" -r 'exit version_compare(PHP_VERSION, "8.3.0", ">=") ? 0 : 1;' 2>/dev/null
}

find_php() {
  # If the operator explicitly points at a PHP binary, trust it: use it as long
  # as it is runnable. This avoids false negatives from the version probe when
  # the terminal's default `php` is an older version (e.g. 8.1).
  if [ -n "${DEPLOY_PHP_BIN:-}" ]; then
    if [ -x "$DEPLOY_PHP_BIN" ] || command -v "$DEPLOY_PHP_BIN" >/dev/null 2>&1; then
      echo "$DEPLOY_PHP_BIN"
      return 0
    fi
  fi
  local candidates=(
    /opt/cpanel/ea-php84/root/usr/bin/php
    /opt/cpanel/ea-php83/root/usr/bin/php
    /usr/local/bin/ea-php84
    /usr/local/bin/ea-php83
    /opt/alt/php84/usr/bin/php
    /opt/alt/php83/usr/bin/php
    php
  )
  local c
  for c in "${candidates[@]}"; do
    if php_ok "$c"; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

PHP_BIN="$(find_php || true)"
if [ -z "$PHP_BIN" ]; then
  echo "ERROR: PHP 8.3+ required (Laravel 13). Terminal has: $(php -v 2>/dev/null | head -1 || echo unknown)"
  echo ""
  echo "Fix in cPanel: MultiPHP Manager -> set cmsr.in to PHP 8.3 or 8.4"
  echo "Then run:  /opt/cpanel/ea-php83/root/usr/bin/php -v"
  echo "Or pass:   DEPLOY_PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php bash scripts/cpanel-deploy.sh"
  exit 1
fi

echo "==> CMSR deploy in $ROOT"
echo "==> Using PHP: $PHP_BIN ($($PHP_BIN -r 'echo PHP_VERSION;'))"

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: Set DEPLOY_DB_PASSWORD before running."
  echo "Example: DEPLOY_DB_PASSWORD='secret' bash scripts/cpanel-deploy.sh"
  exit 1
fi

if [ "${DEPLOY_GIT_PULL:-0}" = "1" ] && [ -d .git ]; then
  echo "==> Sync code from GitHub (optional)"
  git fetch origin 2>/dev/null || true
  git reset --hard origin/laravel 2>/dev/null || true
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
run_composer() {
  if command -v composer >/dev/null 2>&1; then
    "$PHP_BIN" "$(command -v composer)" install --optimize-autoloader --no-dev --no-interaction
  elif [ -x "$HOME/bin/composer" ]; then
    "$PHP_BIN" "$HOME/bin/composer" install --optimize-autoloader --no-dev --no-interaction
  elif [ -f composer.phar ]; then
    "$PHP_BIN" composer.phar install --optimize-autoloader --no-dev --no-interaction
  else
    echo "==> Installing Composer locally..."
    "$PHP_BIN" -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    "$PHP_BIN" composer-setup.php
    rm -f composer-setup.php
    "$PHP_BIN" composer.phar install --optimize-autoloader --no-dev --no-interaction
  fi
}
run_composer

echo "==> Laravel setup"
"$PHP_BIN" artisan key:generate --force

if [ "$MARK_MIGRATIONS" = "1" ]; then
  "$PHP_BIN" artisan cmsr:mark-migrations-run || true
else
  "$PHP_BIN" artisan migrate --force
fi

"$PHP_BIN" artisan storage:link 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

"$PHP_BIN" artisan config:clear
"$PHP_BIN" artisan route:clear
"$PHP_BIN" artisan view:clear
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

if [ "$LINK_PUBLIC_HTML" = "1" ]; then
  echo "==> Point public_html at Laravel public/"
  rm -rf "$HOME/public_html/public" 2>/dev/null || true
  find "$HOME/public_html" -mindepth 1 -maxdepth 1 ! -name 'cgi-bin' -exec rm -rf {} + 2>/dev/null || true
  shopt -s dotglob nullglob
  for item in "$ROOT/public"/*; do
    base="$(basename "$item")"
    rm -rf "$HOME/public_html/$base" 2>/dev/null || true
    ln -sfn "$item" "$HOME/public_html/$base"
  done
  shopt -u dotglob nullglob
fi

echo ""
echo "=============================================="
echo " DEPLOY FINISHED"
echo "=============================================="
echo " PHP:     $PHP_BIN ($($PHP_BIN -r 'echo PHP_VERSION;'))"
echo " Site:    ${APP_URL}/"
echo " Health:  ${APP_URL}/up"
echo " API:     ${APP_URL}/api/health"
echo " Admin:   ${APP_URL}/admin"
echo ""
echo " Set document root to: ${ROOT}/public"
echo " Or: DEPLOY_LINK_PUBLIC_HTML=1 ... bash scripts/cpanel-deploy.sh"
echo "=============================================="
