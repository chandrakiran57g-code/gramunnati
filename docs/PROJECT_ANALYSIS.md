# CMSR App — Complete Project Analysis

**Project:** `CMSR-app`  
**Branch:** `laravel`  
**Repository:** `https://github.com/chandrakiran57g-code/CMSR.git`  
**Last reviewed:** June 2026

---

## 1. Executive summary

CMSR is a full-stack community platform for model villages, schools, development programs, donations, volunteers, and CMS-driven content. The **CMSR-app** codebase is a **Laravel 13 + Inertia.js + React 18** application designed for **cPanel deployment**.

| Aspect | Detail |
|--------|--------|
| **Primary purpose** | Public website + member portal + admin CMS |
| **Backend (data)** | Supabase (PostgreSQL, Auth, Storage) |
| **Backend (HTTP)** | Laravel — single catch-all route, no custom API |
| **Frontend** | React SPA inside Inertia (`CmsrApp.jsx`) |
| **Routing** | React Router (70+ client routes) |
| **i18n** | English + Telugu (`resources/js/i18n/`) |
| **Scale** | ~246 JS/JSX files, ~94 page components |

The app was migrated from a standalone Vite project (`../village_project`) without changing UI or Supabase integration. Laravel exists primarily to satisfy shared-hosting requirements (PHP document root, `.htaccess`, production asset pipeline).

---

## 2. Technology stack

### Backend shell

| Component | Version | Role |
|-----------|---------|------|
| PHP | ^8.3 | Runtime (cPanel) |
| Laravel | ^13.8 | HTTP server, Inertia bridge |
| Inertia Laravel | ^3.1 | Serves one React root page |
| SQLite (default) | — | Laravel sessions/cache only (optional) |

### Frontend

| Component | Version | Role |
|-----------|---------|------|
| React | ^18.2 | UI framework |
| Inertia React | ^2.0 | Laravel ↔ React bridge |
| React Router | ^6.26 | Client-side routing |
| Vite | ^8.0 | Build tool |
| Tailwind CSS | ^3.4 | Styling |
| TanStack Query | ^5.84 | Server state / caching |
| Framer Motion, GSAP | — | Animations |
| Radix UI + shadcn-style | — | Component library |
| Three.js / R3F | — | 3D hero sections |

### External services

| Service | Usage |
|---------|--------|
| **Supabase** | Database, auth, file storage, RLS |
| **Stripe** (optional) | Payment UI components |
| **Base44 compat layer** | Legacy media URL handling |

---

## 3. Architecture model

```
Browser
   │
   ▼
Apache / cPanel (document root → public/)
   │
   ▼
Laravel index.php
   │
   ▼
routes/web.php  →  Inertia::render('Root')   [every URL]
   │
   ▼
resources/views/app.blade.php  +  Vite assets (public/build/)
   │
   ▼
inertia.jsx  →  Root.jsx  →  CmsrApp.jsx
   │
   ├── React Router (public / admin / dashboard routes)
   │
   └── Supabase JS client  →  Supabase Cloud (PostgreSQL + Auth + Storage)
```

**Key insight:** Laravel does not implement business logic. There are **no custom controllers** and **no `routes/api.php`**. Admin protection is **client-side** (`AdminProtectedRoute` + Supabase session).

See [Architecture](./ARCHITECTURE.md) for detailed diagrams.

---

## 4. Directory structure

```
CMSR-app/
├── app/                          # Minimal Laravel app
│   ├── Http/Middleware/
│   │   └── HandleInertiaRequests.php
│   └── Http/Controllers/         # Empty (abstract Controller only)
├── bootstrap/app.php             # Laravel 11+ style bootstrap
├── config/                       # Standard Laravel config
├── database/migrations/          # Default Laravel tables only
├── public/                       # ★ WEB ROOT for cPanel
│   ├── index.php
│   ├── .htaccess
│   └── build/                    # Compiled Vite assets
├── resources/
│   ├── css/app.css
│   ├── js/                       # ★ Entire React application
│   │   ├── CmsrApp.jsx     # Main app + routes
│   │   ├── inertia.jsx           # Vite entry
│   │   ├── pages/                # Route pages (public, admin, dashboard)
│   │   ├── components/           # UI, layout, home, admin
│   │   ├── api/                  # Supabase service modules
│   │   ├── lib/                  # Auth, admin, utilities
│   │   ├── hooks/
│   │   └── i18n/
│   └── views/app.blade.php         # Inertia HTML shell
├── routes/web.php                # Single catch-all route
├── supabase/                     # SQL for RLS + storage
├── scripts/seed-platform-data.js # Demo data seeder
├── docs/                         # This documentation
├── composer.json
├── package.json
└── vite.config.js
```

---

## 5. Routing

### Laravel (server)

```php
// routes/web.php
Route::get('/{any?}', fn () => Inertia::render('Root'))->where('any', '.*');
```

All paths (`/`, `/admin`, `/villages/foo`, etc.) return the same Inertia page. Deep links work because Apache rewrites to `index.php` and React Router reads `window.location`.

### React Router (client)

Defined in `resources/js/CmsrApp.jsx`.

#### Public routes (with `PublicLayout`)

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Homepage with Active Works, Need Support, stats |
| `/villages`, `/villages/:slug` | Villages | Village directory + detail |
| `/schools`, `/schools/:slug` | Schools | School directory + detail |
| `/projects`, `/projects/:slug` | Projects | Development projects |
| `/programs`, `/programs/:slug` | Programs | What We Do programs |
| `/active-works/category/:slug` | ActiveWorksCategory | Full Active Works category list |
| `/active-work/:slug` | ActiveWorkDetail | CMS Active Work detail page |
| `/need-support` | NeedSupport | Urgent projects / donations |
| `/donate` | Donate | Donation flow |
| `/volunteer` | Volunteer | Volunteer registration |
| `/gallery` | Gallery | Photo/video gallery |
| `/page/:slug` | CmsPageView | Dynamic CMS pages (About, etc.) |
| `/teams`, `/teams/:slug` | Teams | Team pages |
| `/partners` | Partners | Partner organisations |
| `/members` | MemberDirectory | Public member list |
| `/stories`, `/news`, `/events` | Content | Stories, news, events |
| `/contact`, `/faqs`, `/search` | Utility | Contact, FAQs, search |

#### Auth routes

| Path | Purpose |
|------|---------|
| `/login`, `/register` | Member Supabase auth |
| `/forgot-password`, `/reset-password` | Password recovery |

#### Member portal (`ProtectedRoute`)

| Path | Purpose |
|------|---------|
| `/dashboard` | Member dashboard |
| `/profile`, `/profile/edit` | Profile management |
| `/my-donations`, `/my-receipts` | Donation history |
| `/my-villages`, `/my-schools` | Linked entities |
| `/volunteer-profile`, `/my-activities` | Volunteer data |
| `/notifications`, `/settings` | User preferences |

#### Admin panel (`AdminProtectedRoute`)

Central paths in `resources/js/lib/adminRoutes.js`. See [Admin Guide](./ADMIN_GUIDE.md).

---

## 6. Data layer (Supabase)

### Client

`resources/js/api/supabaseClient.js` — singleton using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### API modules

| Module | Responsibility |
|--------|----------------|
| `auth.js` | Sign up/in, profiles, roles |
| `entities.js` | Villages, schools, projects CRUD |
| `home.js` | Homepage aggregates |
| `cms.js` | CMS pages, nav config, programs |
| `gallery.js` | Gallery collections |
| `admin.js` | Dashboard stats, uploads, reports |
| `activeWork.js` | Active Works CMS (categories, cards, templates) |
| `needsSupport.js` | Need Support homepage cards |
| `serviceDirectory.js` | Member directory |

### CMS settings store

Platform content stored in Supabase `settings` table as JSON:

| Key | Content |
|-----|---------|
| `active_work_store` | Active Works categories, cards, entity templates |
| `needs_support_store` | Need Support project cards |
| Navigation / site config | Various CMS keys via `cms.js` |

### Laravel database

Default **SQLite** (`database/database.sqlite`) — used only for Laravel internals (sessions, cache, jobs). **Not used for app data.**

---

## 7. Authentication model

### Public members

- Supabase Auth (`auth.js`, `AuthContext.jsx`)
- Email/password registration and login
- Profile stored in `profiles` table
- Protected routes check Supabase session client-side

### Admin panel

- Hardcoded credentials in `resources/js/lib/adminAuth.js`:
  - Email: `test@gmail.com`
  - Password: `testadmin123`
- Flow:
  1. Validate credentials client-side
  2. Sign in to Supabase Auth (same user must exist in Supabase)
  3. Set `sessionStorage` flag `cmsr_admin_session=1`
  4. RLS policies allow `authenticated` role to write

**Security note:** Admin gate is client-side. Real protection depends on Supabase RLS. Change default admin credentials before production and restrict Supabase policies to specific admin user IDs if needed.

---

## 8. Major features

### 8.1 Navbar Manager (Admin)

Manage content that appears in the public navigation:

- About Us CMS pages
- Teams
- Member list
- Programs (What We Do)
- Partner organisations
- Gallery

### 8.2 Active Works

Homepage feature sections (Active Villages, Active Schools, programs, custom templates):

| Admin section | Purpose |
|---------------|---------|
| **Templates** | Create entity types (like Village/School) → shows as "Active {Name}" |
| **Cards** | Homepage cards per template |
| **Detail Pages** | Full detail pages for CMS cards |

Data: `settings.active_work_store` + villages/schools tables for DB-linked entities.

Live updates: `platformRefresh.js` broadcasts changes across tabs without page reload.

### 8.3 Need Support

Urgent donation projects on homepage. Managed in admin; stored in `settings.needs_support_store`.

### 8.4 Donations & receipts

Admin views for donations and receipt generation (PDF via jsPDF).

### 8.5 Volunteers, stories, news

Standard CMS CRUD backed by Supabase tables.

### 8.6 Internationalization

`resources/js/i18n/translations.js` — English and Telugu. Language toggle in public UI.

---

## 9. Build & assets

### Development

```bash
php artisan serve          # Terminal 1 — http://127.0.0.1:8000
npm run dev                # Terminal 2 — Vite HMR
```

### Production build

```bash
npm run build
```

Output: `public/build/manifest.json` + hashed JS/CSS chunks.

**Important:** Supabase keys are baked into the JS bundle at build time (`VITE_*` env vars). Rebuild after changing `.env`.

---

## 10. Relationship to village_project

| | `village_project` | `CMSR-app` |
|--|-------------------|------------------|
| **Branch** | `main` | `laravel` |
| **Bundler** | Vite standalone | Vite + Laravel plugin |
| **Entry** | `src/main.jsx` | `resources/js/inertia.jsx` |
| **Router** | React Router in `App.jsx` | React Router in `CmsrApp.jsx` |
| **Hosting** | Static / Vercel-friendly | cPanel / Apache |
| **Code sync** | Same React components (mirrored paths) | |

Both projects share the same Supabase backend and should stay in sync when features change.

---

## 11. Known limitations & risks

| Item | Severity | Notes |
|------|----------|-------|
| Admin auth client-side | Medium | RLS is the real gate; change default password |
| No server-side route protection | Medium | `/admin` URLs are publicly reachable (UI gated only) |
| Supabase keys in frontend bundle | Expected | Anon key is public by design; rely on RLS |
| Large JS bundle (~1.5 MB) | Low | Consider code-splitting in future |
| Video files in repo | Low | Hero video committed on `laravel` branch — may be large |
| Laravel DB unused | Info | SQLite optional; can ignore for app data |

---

## 12. File statistics

| Metric | Count |
|--------|-------|
| JS/JSX files (`resources/js/`) | ~246 |
| Page components | ~94 |
| API service modules | 12 |
| Supabase SQL scripts | 3 |
| Laravel migrations | 3 (framework defaults) |
| Admin sidebar sections | 9 |

---

## 13. Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_KEY` | Yes | Laravel encryption key |
| `APP_URL` | Yes | Production domain |
| `APP_ENV` | Yes | `production` on live server |
| `APP_DEBUG` | Yes | Must be `false` in production |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `VITE_USE_DEMO_DATA` | No | Fallback demo data |
| `VITE_CAPTCHA_SECRET` | No | Captcha integration |

Full setup: [Supabase Setup](./SUPABASE_SETUP.md)  
Deployment: [cPanel Deployment](./CPANEL_DEPLOYMENT.md)
