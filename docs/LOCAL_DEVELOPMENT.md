# Local Development

Run GramUnnati locally for development and testing.

---

## Requirements

| Tool | Version |
|------|---------|
| PHP | 8.3+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |

Supabase project with keys and SQL scripts applied (see [Supabase Setup](./SUPABASE_SETUP.md)).

---

## First-time setup

```bash
cd gramunnati-app

# Environment
cp .env.example .env

# Edit .env — add your Supabase keys:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key

php artisan key:generate
composer install
npm install
npm run build
php artisan migrate
```

Optional demo data:

```bash
npm run seed:platform
```

---

## Daily development

### Option A — Production-like (recommended for testing)

Terminal 1:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Open: **http://127.0.0.1:8000**

Uses pre-built assets from `public/build/`. Rebuild after JS changes:

```bash
npm run build
```

### Option B — Hot reload (active frontend work)

Terminal 1:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```bash
npm run dev
```

Vite HMR updates React components live. Laravel serves the Inertia shell; Vite dev server injects hot assets.

---

## All-in-one dev script

Composer includes a concurrent dev script (requires `npx concurrently`):

```bash
composer dev
```

Runs simultaneously:

- `php artisan serve`
- `php artisan queue:listen`
- `php artisan pail` (logs)
- `npm run dev`

---

## Environment variables (local)

```env
APP_NAME=GramUnnati
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional — use demo data when Supabase unavailable
# VITE_USE_DEMO_DATA=true
```

---

## Useful commands

| Command | Purpose |
|---------|---------|
| `php artisan serve` | Start Laravel dev server |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production asset build |
| `npm run lint` | ESLint on `resources/js` |
| `npm run seed:platform` | Seed Supabase demo data |
| `php artisan migrate` | Run Laravel migrations (SQLite) |
| `php artisan config:clear` | Clear config cache |
| `composer test` | Run PHPUnit tests |

---

## Admin login (local)

1. Ensure Supabase admin user exists: `test@gmail.com` / `testadmin123`
2. Visit: http://127.0.0.1:8000/admin/login
3. Run SQL scripts if saves fail (see [Supabase Setup](./SUPABASE_SETUP.md))

---

## Syncing with village_project

The standalone Vite app lives at `../village_project` (Git branch `main`).

| gramunnati-app | village_project |
|----------------|-----------------|
| `resources/js/` | `src/` |
| `GramUnnatiApp.jsx` | `App.jsx` |

When adding features, update **both** codebases to keep them in sync.

Local Vite-only dev (no Laravel):

```bash
cd ../village_project
npm run dev -- --host 127.0.0.1 --port 5173
```

Open: **http://127.0.0.1:5173**

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page | Run `npm run build`; check browser console |
| Vite manifest error | Run `npm run dev` OR `npm run build` |
| Supabase connection failed | Check `VITE_*` in `.env`; rebuild after changes |
| Admin save fails | Create admin user; run `admin-policies.sql` |
| Port 8000 in use | Use `--port=8001` |
| PHP version error | Ensure PHP 8.3+: `php -v` |

Logs: `storage/logs/laravel.log`

---

## Related docs

- [Supabase Setup](./SUPABASE_SETUP.md)
- [Architecture](./ARCHITECTURE.md)
- [cPanel Deployment](./CPANEL_DEPLOYMENT.md)
