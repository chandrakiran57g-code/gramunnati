# GramUnnati — Laravel + Inertia + React

Converted from the Vite SPA (`../village_project`) for **cPanel deployment** with **zero visual or functional changes**.

## Stack

- **Laravel 13** — HTTP server, cPanel-compatible PHP hosting
- **Inertia.js** — bridges Laravel and React
- **React 18** — original UI in `resources/js/`
- **Supabase** — database, auth, storage (`VITE_SUPABASE_*` in `.env`)

## Documentation

Full documentation is in the **[docs/](./docs/)** folder:

| Guide | Description |
|-------|-------------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/PROJECT_ANALYSIS.md](./docs/PROJECT_ANALYSIS.md) | Complete codebase analysis |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & data flow |
| [docs/LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md) | Run locally |
| [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) | Database, auth, RLS |
| [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) | Admin panel reference |
| [docs/CPANEL_DEPLOYMENT.md](./docs/CPANEL_DEPLOYMENT.md) | Production deployment |

## Quick start (local)

```bash
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
php artisan key:generate
composer install
npm install
npm run build
php artisan migrate
php artisan serve
```

Open http://127.0.0.1:8000 — for hot reload run `npm run dev` in a second terminal.

## cPanel deployment

See **[docs/CPANEL_DEPLOYMENT.md](./docs/CPANEL_DEPLOYMENT.md)** for the full guide.

**Key point:** set your domain **document root** to the `public/` folder.

## Project layout

| Path | Purpose |
|------|---------|
| `resources/js/GramUnnatiApp.jsx` | React app (routes, layouts, pages) |
| `resources/js/inertia.jsx` | Inertia bootstrap entry |
| `resources/js/pages/Root.jsx` | Inertia page mounting the React app |
| `routes/web.php` | Catch-all route — every URL serves the app |
| `public/` | Web root for cPanel |
| `supabase/` | RLS & storage SQL scripts |
| `docs/` | Full documentation |

## Git branches

| Branch | Project folder | Hosting |
|--------|----------------|---------|
| `laravel` | `gramunnati-app` | cPanel / Apache |
| `main` | `village_project` | Vite SPA / static |

Repository: https://github.com/chandrakiran57g-code/gramunnati.git

## Why this approach?

The app has **70+ routes**, admin panel, and **Supabase** data layer. The full React Router app runs inside one Inertia root — identical behavior to the Vite SPA, but served by Laravel for cPanel.
