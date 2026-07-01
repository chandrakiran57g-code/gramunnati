# cPanel Deployment Guide

Step-by-step guide to deploy **gramunnati-app** on cPanel shared hosting (Apache + PHP).

---

## Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| PHP | 8.2 | 8.3 |
| Composer | 2.x | Latest |
| Node.js | 18 | 20 LTS |
| npm | 9+ | Latest |
| Apache | mod_rewrite enabled | — |
| SSL | Recommended | Let's Encrypt via cPanel |

**Database:** The app uses **Supabase** (cloud). You do **not** need MySQL on cPanel for application data. Laravel's default SQLite is optional (sessions/cache only).

---

## Deployment checklist

- [ ] Supabase project configured (see [Supabase Setup](./SUPABASE_SETUP.md))
- [ ] Admin user created in Supabase Auth
- [ ] RLS SQL scripts executed
- [ ] Files uploaded to server
- [ ] Document root set to `public/`
- [ ] `.env` configured with production values
- [ ] `composer install --no-dev` completed
- [ ] `npm run build` completed
- [ ] Storage permissions set
- [ ] Laravel caches optimized
- [ ] Site loads over HTTPS

---

## Step 1 — Prepare locally (recommended)

Build assets locally before upload to avoid Node.js issues on shared hosting:

```bash
cd gramunnati-app

# Copy environment template
cp .env.example .env

# Edit .env with production values (see Step 4)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# APP_URL=https://yourdomain.com

php artisan key:generate
composer install --optimize-autoloader --no-dev
npm ci
npm run build
```

Verify `public/build/manifest.json` exists and contains entry files.

---

## Step 2 — Upload files

Upload the entire `gramunnati-app` folder via:

- **cPanel File Manager**, or
- **FTP/SFTP** (FileZilla, WinSCP)

Suggested server path:

```
/home/username/gramunnati-app/
```

### Files to upload

Upload the full project **except** (optional, can regenerate on server):

- `node_modules/` — regenerate with `npm ci` if building on server
- `vendor/` — regenerate with `composer install` on server
- `.git/` — not needed on server

### Files you must NOT expose publicly

These stay **outside** the web root (`public/`):

- `.env` — secrets
- `storage/` — logs
- `vendor/`, `resources/` — source code

---

## Step 3 — Set document root

In **cPanel → Domains → Domains** (or Subdomains):

| Setting | Value |
|---------|-------|
| Document Root | `/home/username/gramunnati-app/public` |

**Critical:** The document root must be the `public/` folder, **not** the project root.

### If you cannot change document root

Add a root `.htaccess` in the project folder (one level above `public/`):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

Prefer pointing the domain directly to `public/` when possible.

---

## Step 4 — Configure environment

SSH or cPanel Terminal:

```bash
cd ~/gramunnati-app
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=GramUnnati
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Supabase — required (same project as development)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional
# VITE_USE_DEMO_DATA=false
```

### Important notes

1. **`APP_DEBUG=false`** in production — never leave `true` on live sites.
2. **`APP_URL`** must match your actual domain (with `https://`).
3. **`VITE_*` keys** are compiled into JS at build time. If you change them on the server, run `npm run build` again.

---

## Step 5 — Install PHP dependencies

```bash
cd ~/gramunnati-app
composer install --optimize-autoloader --no-dev
```

If Composer is not in PATH, use cPanel's Composer interface or:

```bash
php ~/composer.phar install --optimize-autoloader --no-dev
```

---

## Step 6 — Build frontend (if not built locally)

```bash
cd ~/gramunnati-app
npm ci
npm run build
```

Confirm output:

```bash
ls public/build/manifest.json
```

If Node.js is unavailable on your host, **always build locally** and upload `public/build/`.

---

## Step 7 — Laravel permissions

```bash
chmod -R 775 storage bootstrap/cache
```

In cPanel File Manager: ensure `storage/` and `bootstrap/cache/` are writable by the web server user (`nobody` or `username` depending on host).

---

## Step 8 — Laravel optimization

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Run after every `.env` change:

```bash
php artisan config:clear
php artisan config:cache
```

---

## Step 9 — Apache / SSL

### mod_rewrite

Laravel's `public/.htaccess` handles URL rewriting. Ensure **mod_rewrite** is enabled (default on most cPanel hosts).

### HTTPS

Enable SSL in cPanel → SSL/TLS → Let's Encrypt. Update `APP_URL` to `https://`.

Optional force HTTPS in `public/.htaccess` (add after `RewriteEngine On`):

```apache
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Step 10 — Verify deployment

| Test | Expected |
|------|----------|
| `https://yourdomain.com/` | Homepage loads |
| `https://yourdomain.com/admin/login` | Admin login page |
| `https://yourdomain.com/villages` | Villages list |
| Refresh on deep URL | No 404 (e.g. `/active-works/category/active-villages`) |
| Admin login + save | CMS changes persist |
| Browser console | No Supabase connection errors |

Health check (Laravel built-in):

```
https://yourdomain.com/up
```

Should return `200 OK`.

---

## Updating after code changes

```bash
cd ~/gramunnati-app
git pull origin laravel          # if using Git on server
composer install --no-dev
npm ci && npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Or upload changed files via FTP and rebuild assets.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank white page | Missing build assets | Run `npm run build`; check `public/build/manifest.json` |
| 500 Internal Server Error | Permissions / missing key | Check `storage/logs/laravel.log`; run `php artisan key:generate` |
| 404 on refresh | Wrong document root | Point domain to `public/`; check `.htaccess` |
| Supabase errors in console | Wrong/missing `VITE_*` keys | Fix `.env`, rebuild with `npm run build` |
| Admin can't save | Auth user / RLS missing | Create admin in Supabase Auth; run `supabase/admin-policies.sql` |
| CSS/JS 404 | Stale manifest | Rebuild assets; clear browser cache |
| "Vite manifest not found" | No production build | Run `npm run build` on server or upload `public/build/` |
| PHP version error | PHP < 8.2 | Set PHP 8.3 in cPanel → MultiPHP Manager |

### Log location

```
storage/logs/laravel.log
```

View via cPanel File Manager or:

```bash
tail -f storage/logs/laravel.log
```

---

## Git deployment (optional)

If SSH + Git available on cPanel:

```bash
cd ~/gramunnati-app
git clone -b laravel https://github.com/chandrakiran57g-code/gramunnati.git .
cp .env.example .env
# configure .env
composer install --no-dev
npm ci && npm run build
php artisan key:generate
php artisan config:cache
chmod -R 775 storage bootstrap/cache
```

---

## Security hardening (production)

1. Set `APP_DEBUG=false`
2. Change default admin password in Supabase + `adminAuth.js` (or move to env)
3. Restrict Supabase RLS to specific admin user UUID
4. Enable HTTPS only
5. Never commit `.env` to Git
6. Keep PHP and Composer dependencies updated

---

## Related docs

- [Supabase Setup](./SUPABASE_SETUP.md)
- [Local Development](./LOCAL_DEVELOPMENT.md)
- [Project Analysis](./PROJECT_ANALYSIS.md)
