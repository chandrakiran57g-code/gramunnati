#!/usr/bin/env bash
# Create database/cmsrr.sql on cPanel (MySQL dump for backup or phpMyAdmin import).
#
# Usage (from project root ~/cmsr):
#
#   Export current DB only (after you already have data):
#     DEPLOY_DB_PASSWORD='your-db-password' bash scripts/cpanel-export-cmsrr.sh
#
#   Bootstrap empty DB + seed + export (first-time setup):
#     CMSRR_CONFIRM=1 DEPLOY_DB_PASSWORD='your-db-password' bash scripts/cpanel-export-cmsrr.sh --seed
#
# Output: ~/cmsr/database/cmsrr.sql

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="export"
for arg in "$@"; do
  case "$arg" in
    --seed|--fresh) MODE="seed" ;;
    --help|-h)
      sed -n '2,14p' "$0"
      exit 0
      ;;
  esac
done

DB_PASSWORD="${DEPLOY_DB_PASSWORD:-}"
DB_DATABASE="${DEPLOY_DB_DATABASE:-cmsr_db}"
DB_USERNAME="${DEPLOY_DB_USERNAME:-cmsr_user}"
DB_HOST="${DEPLOY_DB_HOST:-localhost}"
DB_PORT="${DEPLOY_DB_PORT:-3306}"

php_ok() {
  local bin="$1"
  [ -n "$bin" ] || return 1
  [ -x "$bin" ] || command -v "$bin" >/dev/null 2>&1 || return 1
  "$bin" -r 'exit version_compare(PHP_VERSION, "8.3.0", ">=") ? 0 : 1;' 2>/dev/null
}

find_php() {
  if [ -n "${DEPLOY_PHP_BIN:-}" ] && php_ok "$DEPLOY_PHP_BIN"; then
    echo "$DEPLOY_PHP_BIN"
    return 0
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
  echo "ERROR: PHP 8.3+ required. Set DEPLOY_PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php"
  exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: Set DEPLOY_DB_PASSWORD (MySQL password for ${DB_USERNAME})."
  echo "Example: DEPLOY_DB_PASSWORD='secret' bash scripts/cpanel-export-cmsrr.sh"
  exit 1
fi

echo "==> CMSRR SQL export in $ROOT"
echo "==> PHP: $PHP_BIN ($($PHP_BIN -r 'echo PHP_VERSION;'))"

ensure_env() {
  if [ -f .env ] && grep -q '^DB_DATABASE=' .env 2>/dev/null; then
    return 0
  fi
  echo "==> Writing minimal .env for database connection"
  APP_KEY="$($PHP_BIN -r "echo 'base64:'.base64_encode(random_bytes(32));")"
  cat > .env <<ENVFILE
APP_NAME=CMSR
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=${DEPLOY_APP_URL:-https://cmsr.in}

DB_CONNECTION=mysql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD="${DB_PASSWORD}"

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
ENVFILE
}

ensure_vendor() {
  if [ -f vendor/autoload.php ]; then
    return 0
  fi
  echo "==> vendor/ missing — running composer install (required for artisan)"
  if command -v composer >/dev/null 2>&1; then
    "$PHP_BIN" "$(command -v composer)" install --optimize-autoloader --no-dev --no-interaction
  elif [ -f composer.phar ]; then
    "$PHP_BIN" composer.phar install --optimize-autoloader --no-dev --no-interaction
  else
    echo "ERROR: Run deploy first: DEPLOY_DB_PASSWORD='...' bash scripts/cpanel-deploy.sh"
    exit 1
  fi
}

ensure_env
ensure_vendor

if [ "$MODE" = "seed" ]; then
  if [ "${CMSRR_CONFIRM:-}" != "1" ]; then
    echo ""
    echo "WARNING: --seed will DROP ALL TABLES in ${DB_DATABASE} and re-seed demo data."
    echo "To continue, run:"
    echo "  CMSRR_CONFIRM=1 DEPLOY_DB_PASSWORD='...' bash scripts/cpanel-export-cmsrr.sh --seed"
    exit 1
  fi
  echo "==> migrate:fresh --seed (drops all data in ${DB_DATABASE})"
  "$PHP_BIN" artisan migrate:fresh --seed --force
else
  echo "==> Exporting current database (no --seed; use --seed to rebuild from seeder first)"
fi

if [ ! -f database/cmsrr.sql ]; then
  echo "ERROR: database/cmsrr.sql missing. Run: git pull origin laravel"
  exit 1
fi

echo "==> php artisan cmsr:export-sql"
"$PHP_BIN" artisan cmsr:export-sql --path=database/cmsrr.sql

OUT="$ROOT/database/cmsrr.sql"
BYTES="$(wc -c < "$OUT" | tr -d ' ')"

echo ""
echo "=============================================="
echo " cmsrr.sql CREATED"
echo "=============================================="
echo " File:   $OUT"
echo " Size:   $BYTES bytes"
echo ""
echo " Download via cPanel File Manager or:"
echo "   cat database/cmsrr.sql | head"
echo ""
echo " Import elsewhere: phpMyAdmin → cmsr_db → Import → cmsrr.sql"
echo " Admin after --seed: test@gmail.com / testadmin123"
echo "=============================================="
