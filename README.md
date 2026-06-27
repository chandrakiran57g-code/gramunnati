# GramUnnati — Laravel + Inertia + React

Converted from the Vite SPA (`../village_project`) for **cPanel deployment** with **zero visual or functional changes**.

## Stack

- **Laravel 13** — server, routing, cPanel-compatible PHP hosting
- **Inertia.js** — bridges Laravel and React
- **React 18** — original UI copied unchanged into `resources/js/`
- **Supabase** — same database/auth as before (via `VITE_SUPABASE_*` in `.env`)

## Quick start (local)

```bash
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
php artisan key:generate
composer install
npm install
npm run build
php artisan migrate
php artisan serve
```

Open http://127.0.0.1:8000

For hot reload during development, run `npm run dev` in a second terminal.

## cPanel deployment

See **[CPANEL_DEPLOY.md](./CPANEL_DEPLOY.md)** for full steps.

Key point: set your domain **document root** to the `public/` folder.

## Project layout

| Path | Purpose |
|------|---------|
| `resources/js/GramUnnatiApp.jsx` | Original React app (routes, layouts, pages) |
| `resources/js/inertia.jsx` | Inertia bootstrap entry |
| `resources/js/Pages/Root.jsx` | Single Inertia page that mounts the React app |
| `routes/web.php` | Catch-all route — every URL serves the app |
| `resources/js/pages/` | All original page components (unchanged) |
| `supabase/` | RLS SQL from original project |

## Why this approach?

Your app has **70+ routes**, admin panel, and **Supabase** data layer. To guarantee **no visual or functional regressions**, the full React Router app runs inside one Inertia root — identical behavior to the Vite SPA, but served by Laravel for cPanel.

## Original project

The Vite SPA remains at `../village_project` for reference. Use `gramunnati-app` going forward for cPanel hosting.
