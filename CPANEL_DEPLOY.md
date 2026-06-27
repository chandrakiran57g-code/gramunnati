# GramUnnati — cPanel Deployment (Laravel + Inertia + React)

This project is a **Laravel 13** app with **Inertia.js** and the original **React** frontend preserved unchanged. All pages, admin panel, and Supabase data work exactly as in the Vite SPA version.

## Requirements (cPanel)

- PHP **8.2+** (8.3 recommended)
- Composer (via SSH or cPanel Terminal)
- Node.js **18+** (for building assets once)
- MySQL (optional — app uses **Supabase** for data; Laravel DB is only for sessions/cache if enabled)

## 1. Upload files

Upload the entire `gramunnati-app` folder to your hosting (e.g. `~/gramunnati-app`).

**Document root** must point to the `public` folder:

```
/home/username/gramunnati-app/public
```

In cPanel → Domains → Document Root, set it to `public`, not the project root.

## 2. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=GramUnnati
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Install PHP dependencies

```bash
composer install --optimize-autoloader --no-dev
```

## 4. Build frontend assets

```bash
npm ci
npm run build
```

This creates `public/build/` with compiled CSS/JS.

## 5. Laravel permissions

```bash
chmod -R 775 storage bootstrap/cache
```

Ensure `storage/` and `bootstrap/cache/` are writable by the web server.

## 6. Optimize for production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 7. Apache (.htaccess)

Laravel's `public/.htaccess` is included. Ensure `mod_rewrite` is enabled.

If your host requires a root `.htaccess` redirect:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

## Local development

Terminal 1:
```bash
php artisan serve
```

Terminal 2:
```bash
npm run dev
```

Open http://localhost:8000

## Architecture notes

- **Laravel** serves all URLs via a catch-all route → Inertia `Root` page
- **React Router** inside the app handles client navigation (unchanged)
- **Supabase** remains the database/API (copy keys from your existing `.env`)
- **No visual or functional changes** — same components, same admin, same auth flow

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page | Run `npm run build`; check `public/build/manifest.json` exists |
| 500 error | Check `storage/logs/laravel.log`; fix permissions |
| Supabase errors | Verify `VITE_*` keys in `.env` and rebuild assets |
| Routes 404 | Document root must be `public/`; enable mod_rewrite |
