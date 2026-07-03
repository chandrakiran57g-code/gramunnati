# Migrate GramUnnati from Supabase to Laravel + MySQL (cPanel)

Replace all Supabase dependencies (database, auth, file storage) with Laravel + MySQL, keeping the React frontend intact. Deploy on cPanel.

## Scope of Change

> [!CAUTION]
> This is a **major rewrite** of the backend. Currently, the React app makes **~200+ direct Supabase calls** across 12 API modules. Every one of these must be replaced with a Laravel API endpoint. Estimated effort: **several days of focused work**, executed in phases.

### What changes

| Layer | Current (Supabase) | Target (Laravel + MySQL) |
|-------|-------------------|-------------------------|
| **Database** | Supabase PostgreSQL (cloud) | MySQL on cPanel |
| **Auth** | Supabase Auth (JWT, sessions) | Laravel Sanctum (SPA cookie auth) |
| **File storage** | Supabase Storage buckets | Laravel filesystem (`storage/app/public`) |
| **API calls** | React → Supabase JS client (browser) | React → Laravel `/api/*` routes (server) |
| **Admin auth** | Hardcoded client-side creds + Supabase session | Server-side Laravel middleware + DB roles |
| **RLS** | Supabase Row Level Security | Laravel policies + middleware |

### What stays the same
- All React components, pages, layouts, routing
- Tailwind design system, UI primitives
- i18n (English/Telugu)
- `platformRefresh.js` live update mechanism
- Vite build, Inertia shell

---

## User Review Required

> [!IMPORTANT]
> **cPanel Requirements** — Before I start, please confirm:
> 1. Your cPanel has **PHP 8.2+** and **MySQL** available?
> 2. You have **SSH access** or at minimum cPanel Terminal?
> 3. **Composer** is available on server (or you'll build locally and upload)?
> 4. Do you have a **domain** ready, or using a subdomain?

> [!WARNING]
> **Data migration**: Your existing data in Supabase will NOT automatically move. After building the MySQL schema, you'll need to **export from Supabase → import to MySQL** (I can help with this). Do you have data in Supabase you need to preserve, or is this a fresh start?

## Open Questions — ANSWERED

1. **Existing data**: ✅ **Migrate existing Supabase data** — export CSV/SQL from Supabase, import after MySQL schema + import command built (Phase 6).
2. **Email**: ✅ **Yes** — password reset + notifications via cPanel SMTP (`MAIL_*` in `.env`).
3. **Payments**: ✅ **Keep Stripe** — Laravel backend will hold `STRIPE_SECRET`; frontend keeps publishable key.
4. **File uploads**: ✅ **Unlimited storage on cPanel** — use Laravel `storage/app/public` + `php artisan storage:link`.

## cPanel Environment (confirmed)

| Item | Value |
|------|-------|
| MySQL | 8.0.46, `localhost`, user prefix `myvillagemart@localhost` |
| PHP | 8.3.31 |
| phpMyAdmin | 5.2.2 |
| SSH | Available (use cPanel Terminal) |
| Composer | Not installed yet — install via one-time script on server |
| Domain | Ready — point document root to `public/` |

**User-facing action plan:** [docs/CPANEL_MYSQL_MIGRATION_GUIDE.md](./gramunnati-app/docs/CPANEL_MYSQL_MIGRATION_GUIDE.md)


## Proposed Changes

This is organized into 7 phases, each building on the previous.

---

### Phase 1: Database Schema (MySQL Migrations)

Create Laravel migrations for all 30+ tables currently in Supabase. Derived from the SQL scripts and API query patterns.

#### [NEW] Migration files in `database/migrations/`

Tables to create (grouped):

**Core entities:**
- `villages` — village_name, slug, state_id, district_id, mandal_id, cover_image, description, short_description, population, pincode, is_featured, is_active, display_order, primary_representative_id, deleted_at
- `schools` — school_name, slug, village_id, state_id, school_type, cover_image, description, student_count, teacher_count, classroom_count, udise_code, is_featured, is_active, display_order, deleted_at
- `projects` — project_name, slug, village_id, school_id, project_category_id, state_id, status, cover_image, description, short_description, budget_amount, raised_amount, funding_goal, is_featured, category, deleted_at
- `project_categories` — name, slug, icon
- `project_updates` — project_id, content, created_at

**Geography:**
- `states` — name, code, is_active
- `districts` — name, state_id, is_active
- `mandals` — name, district_id, is_active

**CMS & content:**
- `cms_pages` — title, slug, content, status ('active'/'inactive'), display_order
- `settings` — key (unique), value (longtext/JSON)
- `programs` — title, slug, description, short_description, icon, sort_order, status
- `team_groups` — name, slug, description, display_order, status
- `team_members` — team_group_id, name, designation, photo, bio, is_active, sort_order
- `partners` — name, slug, logo, website, description
- `beneficiaries` — name, slug, village_id, school_id, description
- `news` — title, slug, content, featured_image, published_at, is_published, deleted_at
- `events` — title, slug, description, start_date, end_date, location, featured_image, is_published, deleted_at
- `success_stories` — title, slug, content, featured_image, village_id, school_id, published_at, is_featured, deleted_at
- `faqs` — question, answer, sort_order, is_active
- `testimonials` — name, content, designation, photo, is_featured, sort_order
- `documents` — documentable_type, documentable_id, title, file_path, file_type, file_size
- `galleries` — galleryable_type, galleryable_id, title, image_path, video_url, sort_order
- `impact_metrics` — label, value, icon, sort_order

**Users & auth:**
- `users` — Laravel's built-in (name, email, password, etc.)
- `profiles` — user_id, full_name, mobile, email, profile_photo, occupation, profession, state_id, district_id, mandal_id, village_id
- `roles` — name
- `user_roles` — user_id, role_id
- `user_categories` — name, slug
- `user_category_user` — user_id, category_id

**Interactions:**
- `donations` — user_id, amount, payment_status, target_type, village_id, school_id, project_id, donor_name, donor_email, donor_phone
- `donation_receipts` — donation_id, receipt_number, receipt_path
- `volunteers` — user_id, skills, availability, state, status
- `volunteer_activities` — volunteer_id, project_id, activity_date, description
- `contact_messages` — name, email, phone, subject, message, status
- `notifications` — user_id, title, message, is_read, read_at
- `audit_logs` — user_id, action, module, record_id, old_values, new_values
- `activity_logs` — loggable_type, loggable_id, title, description, activity_type, activity_date

**Follow relationships:**
- `village_followers` — village_id, user_id
- `school_followers` — school_id, user_id
- `village_needs` — village_id, title, priority, description
- `school_requirements` — school_id, title, priority, description

---

### Phase 2: Laravel Backend (Models + API Controllers)

#### [NEW] Eloquent Models in `app/Models/`

One model per table (~35 models) with relationships defined:
- `Village` hasMany Schools, Projects, Galleries, ActivityLogs; belongsTo State, District, Mandal
- `School` belongsTo Village; hasMany Projects, Galleries
- `Profile` belongsTo User, State, District, Mandal, Village; belongsToMany Roles
- etc.

#### [NEW] API Controllers in `app/Http/Controllers/Api/`

| Controller | Replaces API module | Endpoints |
|-----------|-------------------|-----------|
| `AuthController` | `api/auth.js` | login, register, logout, profile, update-profile, reset-password |
| `VillageController` | `api/entities.js` (villages) | index, show(slug), needs, schools, projects, gallery, timeline, follow/unfollow |
| `SchoolController` | `api/entities.js` (schools) | index, show(slug), requirements, gallery, timeline, follow/unfollow |
| `ProjectController` | `api/entities.js` (projects) | index, show(slug), updates, categories |
| `DonationController` | `api/entities.js` (donations) | store, my-donations |
| `VolunteerController` | `api/entities.js` (volunteers) | register, profile, activities |
| `HomeController` | `api/home.js` | page-data (stats, featured, activity, etc.) |
| `CmsController` | `api/cms.js` | pages, programs, teams, partners, beneficiaries, news, events, stories, faqs, testimonials, gallery, settings, search |
| `AdminController` | `api/admin.js` | dashboard-stats, CRUD for all entities, users, messages, reports, audit-logs |
| `ActiveWorkController` | `api/activeWork.js` | store read/write, templates, cards, categories, detail pages |
| `NeedSupportController` | `api/needsSupport.js` | store read/write, homepage items |
| `GalleryController` | `api/gallery.js` | collections CRUD, media upload |
| `UploadController` | `api/admin.js` (galleryService) | file upload to local storage |
| `GeographyController` | `api/cms.js` (geographyService) | states, districts, mandals |
| `NotificationController` | `api/cms.js` (notificationsService) | list, mark-read, unread-count |
| `SearchController` | `api/cms.js` (searchService) | global search |

#### [NEW] `routes/api.php`

~80+ RESTful API routes, grouped:
```
/api/auth/*          — login, register, logout, profile
/api/home/*          — homepage data
/api/villages/*      — public village endpoints
/api/schools/*       — public school endpoints
/api/projects/*      — public project endpoints
/api/cms/*           — pages, programs, teams, etc.
/api/search          — global search
/api/geo/*           — states, districts, mandals
/api/donations       — create donation
/api/volunteers      — register
/api/contact         — submit message
/api/dashboard/*     — member portal (auth required)
/api/admin/*         — admin-only CRUD (admin middleware)
/api/upload          — file upload
```

#### [NEW] Middleware

- `app/Http/Middleware/AdminMiddleware.php` — checks user has `Super Admin` role in DB
- Laravel Sanctum SPA authentication (cookie-based, same domain)

#### [NEW] `app/Policies/` — Authorization policies for admin vs member access

---

### Phase 3: Authentication (Laravel Sanctum)

#### [MODIFY] `config/sanctum.php`
Configure for SPA cookie authentication (stateful domains).

#### [MODIFY] `bootstrap/app.php`
Add Sanctum middleware to API group.

#### [NEW] `app/Http/Controllers/Api/AuthController.php`
- `POST /api/auth/register` — create user + profile (email or mobile-based)
- `POST /api/auth/login` — email/password or mobile/password
- `POST /api/auth/logout` — destroy session
- `GET /api/auth/user` — current user + profile + roles
- `PUT /api/auth/profile` — update profile
- `POST /api/auth/forgot-password` — send reset email
- `POST /api/auth/reset-password` — reset with token

---

### Phase 4: File Storage (Local Disk)

#### [MODIFY] `config/filesystems.php`
Configure `public` disk for uploads. Create symlink `storage:link`.

#### [NEW] `app/Http/Controllers/Api/UploadController.php`
- `POST /api/upload` — accepts file + bucket/path, stores to `storage/app/public/uploads/{bucket}/{path}`, returns public URL
- Replaces all Supabase Storage calls

---

### Phase 5: Frontend API Layer Rewrite

This is the largest change by file count. Every `api/*.js` module is rewritten.

#### [MODIFY] `resources/js/api/supabaseClient.js` → **DELETE** (replaced by `apiClient.js`)

#### [NEW] `resources/js/api/apiClient.js`
Axios/fetch wrapper that:
- Points to `/api/` (same origin)
- Sends CSRF token (from cookie)
- Handles 401 → redirect to login
- JSON request/response by default

#### [MODIFY] All 12 API modules — rewrite every function
Each `supabase.from('table').select(...)` call becomes `apiClient.get('/api/villages', { params })`.

| File | Functions to rewrite |
|------|---------------------|
| `api/auth.js` | 12 functions |
| `api/entities.js` | ~25 functions |
| `api/home.js` | 17 functions |
| `api/cms.js` | ~35 functions |
| `api/admin.js` | ~25 functions |
| `api/activeWork.js` | ~20 functions |
| `api/needsSupport.js` | ~10 functions |
| `api/gallery.js` | ~10 functions |
| `api/serviceDirectory.js` | ~3 functions |

#### [MODIFY] `resources/js/lib/AuthContext.jsx`
- Remove Supabase auth listener
- Use Laravel Sanctum session (fetch `/api/auth/user` on mount)
- Login/logout via `/api/auth/login`, `/api/auth/logout`

#### [MODIFY] `resources/js/lib/adminAuth.js`
- Remove hardcoded credentials
- Admin login via `/api/auth/login` (server validates role)

#### [MODIFY] `resources/js/lib/adminDb.js`
- Remove `ensureAdminDbAccess()` (server handles auth)
- `adminDbMutation` becomes a simple pass-through

#### [DELETE] `resources/js/api/supabaseClient.js`
#### [DELETE] `resources/js/api/base44Client.js`
#### [DELETE] `resources/js/api/base44Compat.js`

#### [MODIFY] `resources/js/components/AdminProtectedRoute.jsx`
- Check admin status via API call instead of `sessionStorage`

#### [MODIFY] `resources/js/components/admin/AdminMediaUpload.jsx`
- Upload via `/api/upload` instead of Supabase Storage

---

### Phase 6: Cleanup & Build

#### [MODIFY] `package.json`
Remove: `@supabase/supabase-js`
Add: `axios` (for API calls)

#### [MODIFY] `.env`
Remove: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
Add: `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

#### [DELETE] `supabase/` directory (SQL scripts no longer needed)
#### [DELETE] `resources/js/api/base44Client.js`, `base44Compat.js`
#### [DELETE] `resources/js/main.jsx` (dead file)
#### [DELETE] `resources/views/welcome.blade.php` (unused 72KB)
#### [DELETE] `vercel.json` (not deploying to Vercel)

---

### Phase 7: cPanel Deployment

1. Create MySQL database in cPanel → update `.env`
2. Upload project files
3. Set document root to `public/`
4. Run `composer install --no-dev`
5. Run `php artisan migrate` to create all tables
6. Run `php artisan storage:link` for file uploads
7. Run `npm run build` for frontend assets
8. Run `php artisan config:cache && php artisan route:cache`
9. Create admin user via `php artisan tinker` or a seeder
10. Test all routes

---

## Verification Plan

### Automated Tests
```bash
php artisan test              # PHPUnit API tests
npm run build                 # Ensure frontend builds without Supabase imports
```

### Manual Verification
- Homepage loads with stats from MySQL
- Admin login works (server-validated)
- Admin CRUD: create/edit/delete village, school, project
- Public pages: villages list, village detail, school detail
- Member registration and login
- File upload (gallery, cover images)
- Active Works cards display
- Need Support section displays
- Search works across entities
- Mobile login works
- i18n toggle (English ↔ Telugu) still works

---

## Execution Order

| Phase | What | Depends on |
|-------|------|------------|
| 1 | MySQL migrations | Nothing |
| 2 | Models + API controllers + routes | Phase 1 |
| 3 | Sanctum auth | Phase 2 |
| 4 | File storage | Phase 2 |
| 5 | Frontend API rewrite | Phases 2-4 |
| 6 | Cleanup + build | Phase 5 |
| 7 | cPanel deploy | Phase 6 |

> [!IMPORTANT]
> I recommend executing this in order, testing each phase before moving on. Do you want me to proceed with **Phase 1** (database migrations) after you confirm the open questions above?
