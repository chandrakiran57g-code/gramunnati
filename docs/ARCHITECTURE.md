# Architecture

How CMSR is structured and how requests flow through the system.

---

## 1. High-level overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Apache (cPanel) — Document Root: public/                       │
│  public/.htaccess → rewrite all requests to index.php           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Laravel 13                                                     │
│  • routes/web.php — catch-all GET /{any?}                       │
│  • HandleInertiaRequests middleware                             │
│  • Inertia::render('Root')                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Blade shell: resources/views/app.blade.php                     │
│  • @vite(['resources/css/app.css', 'resources/js/inertia.jsx']) │
│  • @inertia — mounts React root                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  React Application (CmsrApp.jsx)                          │
│  • React Router — 70+ routes                                    │
│  • AuthProvider — member Supabase auth                          │
│  • LanguageProvider — i18n                                      │
│  • QueryClientProvider — React Query                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  Supabase Auth           │   │  Supabase PostgreSQL     │
│  (sessions, JWT)         │   │  (tables + RLS)          │
└──────────────────────────┘   └──────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│  Supabase Storage        │
│  (gallery uploads)       │
└──────────────────────────┘
```

---

## 2. Why Laravel + Inertia + React Router?

The original app was a **Vite SPA** with React Router. cPanel hosting typically requires:

- PHP entry point (`public/index.php`)
- Apache `.htaccess` rewrite rules for client-side routes
- A conventional deployment workflow on shared hosting

**Solution:** Wrap the unchanged React app in Laravel + Inertia:

1. Laravel serves **one HTML page** for every URL.
2. React Router continues to handle all navigation **client-side**.
3. No route migration, no UI rewrite, no API layer added to Laravel.

This is sometimes called a **SPA-in-a-shell** or **hybrid Inertia** pattern (Inertia normally uses per-page components; here only `Root` exists).

---

## 3. Request lifecycle

### First page load (e.g. `https://example.com/villages/kondapur`)

1. Browser requests `/villages/kondapur`
2. Apache rewrites to `public/index.php`
3. Laravel matches catch-all route
4. Inertia renders `Root` with Vite asset URLs from `public/build/manifest.json`
5. Browser downloads JS/CSS bundles
6. `inertia.jsx` bootstraps React
7. `Root.jsx` renders `CmsrApp.jsx`
8. React Router matches `/villages/:slug` → `VillageDetail`
9. Component calls `entities.js` → Supabase fetch
10. Page renders with data

### Client navigation (e.g. click to `/schools`)

1. React Router changes URL **without** full page reload
2. Laravel is **not** involved
3. New page component mounts and fetches from Supabase

### Direct URL refresh on deep link

1. Same as first page load — Laravel must serve `Root` for any path
2. Catch-all route ensures this works

---

## 4. Frontend layer structure

```
resources/js/
├── inertia.jsx              # Entry: createInertiaApp
├── CmsrApp.jsx        # Router + providers + all routes
├── pages/
│   ├── Home.jsx             # Public pages
│   ├── admin/               # Admin CMS pages
│   └── dashboard/           # Member portal
├── components/
│   ├── layout/              # Navbar, Footer, PublicLayout
│   ├── home/                # Homepage sections
│   ├── admin/               # AdminShell, AdminUrlField, uploads
│   └── ui/                  # shadcn-style primitives
├── api/                     # Supabase service layer
├── lib/                     # Auth, admin, settings, utilities
├── hooks/                   # useHomeData, usePlatformRefresh, etc.
└── i18n/                    # translations.js, LanguageContext
```

### Provider tree (simplified)

```
QueryClientProvider
  └── LanguageProvider
        └── AuthProvider
              └── Router
                    └── SplashGate
                          └── Routes
                                ├── PublicLayout → public pages
                                ├── AdminLayout → admin pages
                                └── dashboard pages
```

---

## 5. Data architecture

### Supabase tables (domain data)

Examples (not exhaustive):

| Table | Used for |
|-------|----------|
| `villages`, `schools`, `projects` | Entity directories |
| `cms_pages` | Dynamic About/content pages |
| `settings` | JSON stores (Active Works, Need Support, nav) |
| `programs`, `team_groups`, `team_members` | Programs & teams |
| `donations`, `volunteers` | Donations & volunteers |
| `profiles` | User profiles |
| `gallery_*` | Gallery collections |

### Settings JSON stores

```
settings
├── key: active_work_store
│   └── value: { categories, items, entity_templates }
├── key: needs_support_store
│   └── value: { items: [...] }
└── key: (nav config, etc.)
```

Parsed via `resources/js/lib/settingsStore.js`.

### Active Works data flow

```
Admin saves card/template
        │
        ▼
activeWork.js → writeStore() → Supabase settings table
        │
        ▼
notifyPlatformDataChanged() → localStorage + CustomEvent
        │
        ▼
HomeActiveWorks.jsx refetches → homepage updates live
```

---

## 6. Auth architecture

### Member auth

```
Login.jsx → supabase.auth.signInWithPassword()
         → AuthContext.onAuthStateChange
         → ProtectedRoute checks session
```

### Admin auth

```
AdminLogin.jsx → validateAdminCredentials() [client check]
              → supabase.auth.signInWithPassword() [RLS writes]
              → sessionStorage admin flag
              → AdminProtectedRoute + ensureAdminDbAccess()
```

Admin writes wrapped in `adminDbMutation()` (`lib/adminDb.js`) to ensure Supabase session exists before mutations.

---

## 7. Asset pipeline

```
resources/js/inertia.jsx  ──┐
resources/css/app.css     ──┼──► vite build ──► public/build/
resources/js/pages/Root.jsx ┘         │
                                      ▼
                            manifest.json (asset map)
                                      │
                                      ▼
                    app.blade.php @vite directive loads hashed files
```

**Build-time env:** `VITE_*` variables are embedded in JS at `npm run build`. Changing Supabase keys requires rebuild.

---

## 8. Deployment topology (cPanel)

```
/home/username/
└── CMSR-app/              ← project root (NOT web root)
    ├── app/
    ├── resources/
    ├── storage/                 ← must be writable
    ├── bootstrap/cache/         ← must be writable
    ├── .env                     ← secrets (never public)
    └── public/                  ← ★ DOCUMENT ROOT
        ├── index.php
        ├── .htaccess
        └── build/               ← compiled assets
```

Domain document root in cPanel must point to `public/`, not the project root.

---

## 9. What Laravel does NOT do

| Concern | Handled by |
|---------|------------|
| Business logic | React + Supabase |
| API endpoints | Supabase REST (via JS client) |
| Admin authorization | Client + RLS |
| File uploads | Supabase Storage |
| Email | Not implemented in Laravel |
| Queue jobs | Not used for app features |

Laravel's role is **HTTP delivery**, **Inertia bridge**, and **production compatibility** with cPanel.

---

## 10. Extension points

| To add… | Where to work |
|---------|---------------|
| New public page | `CmsrApp.jsx` route + `pages/` component |
| New admin section | `adminRoutes.js`, `adminNavConfig.js`, admin page |
| New Supabase table | SQL migration in Supabase + new `api/*.js` module |
| New homepage section | `components/home/` + hook/API |
| Server-side API | Would require new Laravel routes (not current pattern) |

When syncing with `village_project`, mirror changes under `resources/js/` ↔ `village_project/src/`.
