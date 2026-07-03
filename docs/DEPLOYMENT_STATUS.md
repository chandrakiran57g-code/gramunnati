# GramUnnati — Deployment Status & Checklist

**Last updated:** June 2026  
**Domain:** `myvillagemart.com`  
**Repo:** `https://github.com/chandrakiran57g-code/gramunnati.git` (branch: `laravel`)

This document answers three questions in one place:

1. **What the developer has done** (coding / migration)
2. **What you have done manually** (cPanel setup)
3. **What you still need to do** to deploy live

---

## At a glance

| Area | Status |
|------|--------|
| cPanel MySQL + data import | ✅ Done by you |
| SSL + domain DNS | ✅ Done by you |
| Email account (`noreply@...`) | ✅ Done by you |
| Laravel + MySQL backend | ✅ Done by developer |
| React frontend (Supabase → Laravel shim) | ✅ Done by developer |
| Local testing | ✅ Passed |
| Code uploaded to cPanel | ❌ Not yet |
| Production `.env` on server | ❌ Not yet |
| Document root → `public/` | ❌ Not yet |
| Live site | ❌ Not yet |

**You can deploy the core site now** (homepage, villages, admin). Stripe, forgot-password email, and Google sign-in can be added later.

---

## 1. What the developer has done (coding)

All work is in the `gramunnati-app` folder on branch `laravel`.

### Database & schema

- Created **8 Laravel migrations** matching your MySQL schema (`database/migrations/2026_06_19_*`)
- Generated **`database/gramunnati.sql`** (~105 KB) — full MySQL dump for cPanel import (you already imported this)
- Added Artisan command **`php artisan gramunnati:mark-migrations-run`** — use this on cPanel because tables already exist from SQL import (do **not** run `migrate:fresh` or `migrate --force` on production)
- Added **`database/seeders/GramunnatiSeeder.php`** for local dev only

### Backend (Laravel API)

- **36 Eloquent models** in `app/Models/`
- **API controllers** in `app/Http/Controllers/Api/`:
  - Geography, Home, Villages, Schools, Projects, CMS, Donations
  - Active Work, Need Support, Admin, Auth, AdminTable, Upload
- **`routes/api.php`** — 40+ public read routes + admin mutation routes
- **Laravel Sanctum** — session/cookie auth for SPA (replaces Supabase Auth)
- **`AdminMiddleware`** — Super Admin only for admin writes
- **`SettingsStore`** — site settings helper
- **Generic DB API** — `GET /api/db/{table}` (public reads), `/api/admin/db/{table}` (admin CRUD)

### Frontend (React — kept, not rewritten)

- **`resources/js/api/apiClient.js`** — fetch wrapper with CSRF + cookies
- **`resources/js/api/supabaseClient.js`** — Supabase-compatible shim → Laravel API (existing pages keep working)
- **`resources/js/api/auth.js`** — Laravel auth
- **`resources/js/lib/AuthContext.jsx`**, **`adminAuth.js`**, **`adminDb.js`** — updated for Laravel

### Auth & session fixes

- Custom **`EnsureFrontendRequestsAreStateful`** middleware — same-origin session on `127.0.0.1:8000` / your domain
- API returns JSON 401 instead of crashing when not logged in
- **`HomeController::pageData()`** stats bug fixed

### Scripts (developer tools)

- `scripts/generate-gramunnati-sql.js` — regenerate SQL from Supabase if needed
- `scripts/generate-models.php` — regenerate Eloquent models

### Verified locally

| Test | Result |
|------|--------|
| `GET /api/health` | OK |
| `GET /api/home/stats`, `/api/home/page-data` | OK |
| `GET /api/villages/kondapur` | OK |
| `GET /api/cms/settings` | OK |
| `POST /api/auth/login` | OK |
| `GET /api/auth/user` (after login) | OK |
| `GET /api/admin/db/roles` (admin) | OK |
| Homepage `/` | HTTP 200 |

**Default admin login (from SQL / seeder):** `test@gmail.com` / `testadmin123`

### Not done yet (optional — not blocking launch)

- Stripe payment processing
- Forgot-password email (SMTP env ready, backend stub only)
- Google OAuth sign-in
- Full end-to-end test of every admin screen in browser

### Code on GitHub

Migration code exists **locally**. It must still be **committed, pushed, or uploaded** to cPanel before deploy.

---

## 2. What you have done manually (cPanel)

Based on your completed setup:

| Step | Task | Your status |
|------|------|-------------|
| 1 | MySQL database + user created (`myvillagemart_gramunnati`) | ✅ Done |
| 2 | **`gramunnati.sql` imported** via phpMyAdmin (~128 queries) | ✅ Done |
| 3 | Email account created (`noreply@myvillagemart.com` or similar) | ✅ Done |
| 4 | Domain **`myvillagemart.com`** → server IP `66.116.227.9` | ✅ Done |
| 5 | **SSL** (Let's Encrypt, active until Sep 2026) | ✅ Done |
| 6 | Supabase CSV export | ⏭ Skipped — data already in SQL file |
| 7 | Stripe keys | ⏭ Optional — later |
| 8 | Upload Laravel app + deploy commands | ❌ **Not yet** |
| 9 | Document root → `public/` | ❌ **Not yet** |

### Your cPanel environment

| Item | Value |
|------|-------|
| PHP | 8.3.31 |
| MySQL | 8.0.46 |
| DB host | `localhost` |
| Table prefix | `myvillagemart_` |
| Web server | Apache |

---

## 3. What you need to do to deploy (Step 8)

Follow this exactly. Full detail also in [MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md) Step 8.

### 3.1 — Upload the project

**Option A — File Manager (easiest if Git is not updated yet)**

1. On your PC, zip the folder `gramunnati-app` (exclude `node_modules`, `vendor`, `.git` if zip is too large)
2. cPanel → **File Manager** → upload to `/home/myvillagemart/`
3. Extract → you should have `/home/myvillagemart/gramunnati-app/`

**Option B — Git (after developer pushes latest code)**

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/gramunnati.git gramunnati-app
cd gramunnati-app
```

### 3.2 — Build frontend on your PC (recommended)

Many cPanel accounts do not have Node.js. Run on your Windows PC:

```powershell
cd c:\Users\USER\Downloads\village_project1\gramunnati-app
npm ci
npm run build
```

Confirm `public/build/manifest.json` exists, then upload the whole project (including `public/build/`) to cPanel.

### 3.3 — Create production `.env` on server

In cPanel File Manager, create `/home/myvillagemart/gramunnati-app/.env` with your real values:

```env
APP_NAME=GramUnnati
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://myvillagemart.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=myvillagemart_gramunnati
DB_USERNAME=myvillagemart_gramunnati_app
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.myvillagemart.com

SANCTUM_STATEFUL_DOMAINS=myvillagemart.com,www.myvillagemart.com

CACHE_STORE=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=mail.myvillagemart.com
MAIL_PORT=465
MAIL_USERNAME=noreply@myvillagemart.com
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD_HERE
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@myvillagemart.com
MAIL_FROM_NAME="${APP_NAME}"
```

> **No `VITE_SUPABASE_*` variables needed.** Supabase is no longer used at runtime.

Copy `.env.example` from the project as a starting point if present.

### 3.4 — Run deploy commands in cPanel Terminal

```bash
cd ~/gramunnati-app

# PHP dependencies
composer install --optimize-autoloader --no-dev

# App key (only if APP_KEY= is empty in .env)
php artisan key:generate

# IMPORTANT: DB already has tables from gramunnati.sql — do NOT run migrate --force
php artisan gramunnati:mark-migrations-run

# Public storage for uploads
php artisan storage:link

# Permissions
chmod -R 775 storage bootstrap/cache

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Do NOT run:**

- `php artisan migrate:fresh` — deletes all data
- `php artisan migrate --force` — may conflict with existing imported tables

**If `npm` is available on server** (optional, if you did not build on PC):

```bash
npm ci
npm run build
```

### 3.5 — Set document root

1. cPanel → **Domains** → **myvillagemart.com** → Manage
2. Set **Document Root** to:

```text
/home/myvillagemart/gramunnati-app/public
```

3. Save and wait 1–2 minutes.

### 3.6 — Test the live site

| Test | URL | Expected |
|------|-----|----------|
| Homepage | `https://myvillagemart.com/` | Loads with village data |
| Health | `https://myvillagemart.com/up` | 200 OK |
| API health | `https://myvillagemart.com/api/health` | `{"ok":true,"service":"gramunnati-api"}` |
| Villages | `https://myvillagemart.com/villages` | List shows |
| Admin login | `https://myvillagemart.com/admin` | Login page |
| Admin auth | Login: `test@gmail.com` / `testadmin123` | Dashboard loads |

If something fails: cPanel File Manager → `storage/logs/laravel.log` → send the last error lines.

---

## 4. Troubleshooting

| Problem | Fix |
|---------|-----|
| White / blank page | Document root must be `.../gramunnati-app/public` not project root |
| 500 error | Check `storage/logs/laravel.log` |
| CSS/JS missing | Run `npm run build` on PC; upload `public/build/` |
| Admin login fails | Check `.env` DB credentials; confirm user exists in `users` table |
| CSRF / session errors | Set `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` correctly |
| `composer: not found` | Install Composer — see [MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md) Step 8.4 |
| Tables already exist error | Use `gramunnati:mark-migrations-run`, not `migrate` |

---

## 5. After go-live (optional)

- [ ] Add Stripe keys to `.env` when ready for donations
- [ ] Wire forgot-password email to SMTP
- [ ] Remove or archive Supabase project (only after confirming live site works)
- [ ] Change default admin password in production

---

## Related documents

| File | Purpose |
|------|---------|
| [MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md) | Your cPanel checklist (Steps 1–8) |
| [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) | Technical deploy reference |
| [CPANEL_MYSQL_MIGRATION_GUIDE.md](./CPANEL_MYSQL_MIGRATION_GUIDE.md) | Migration background |
| [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | Run locally on your PC |
