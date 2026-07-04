# CMSR Project — Complete Summary & Deployment Guide

This document explains **what this project is**, **everything that has been built and fixed so far**, and **exactly what you need to do next** to deploy on cPanel (`cmsr.in`).

---

## 1. What Is This Project?

**CMSR** (Common Man Social Responsibility) is a **village and school development platform**. Citizens can:

- Browse villages, schools, and development projects
- Donate to specific causes
- Register as volunteers
- Read news, stories, FAQs, and CMS pages (About, Vision, Mission, etc.)

**Admin users** manage all content from a dashboard: villages, schools, projects, donations, volunteers, navigation, bilingual (English + Telugu) text, and more.

| Item | Value |
|------|-------|
| **Live domain** | https://cmsr.in |
| **GitHub repo** | https://github.com/chandrakiran57g-code/cmsr |
| **Branch** | `laravel` |
| **Local folder** | `gramunnati-app` (name kept from old project; code is rebranded to CMSR) |
| **Server folder** | `/home/cmsr/cmsr` on cPanel |

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Laravel 13 (PHP 8.3+) |
| **Frontend** | React 18 + Inertia.js |
| **Build tool** | Vite |
| **Database (production)** | MySQL on cPanel (`cmsr_db` / `cmsr_user`) |
| **Database (local dev)** | SQLite (in your local `.env`) |
| **API layer** | Laravel REST API at `/api/db/*` — the React app uses a Supabase-compatible client that talks to Laravel/MySQL (Supabase is **not** required at runtime anymore) |
| **Hosting** | cPanel shared hosting |

The React app has **70+ public routes** and a full **admin panel**. It runs inside one Inertia root page — same behavior as the original Vite SPA, but served by Laravel for cPanel compatibility.

---

## 3. What Has Been Done (Complete List)

### 3.1 Platform conversion & rebrand

- Converted from standalone Vite SPA to **Laravel + Inertia + React**
- Rebranded from “Gramunnati” to **CMSR** (`CmsrApp.jsx`, `CmsrLeaf.jsx`, etc.)
- Removed old/unused files (legacy SQL, old seeders, duplicate scripts)
- Git remote **`cmsr`** points to `https://github.com/chandrakiran57g-code/cmsr.git`

### 3.2 Database — MySQL instead of Supabase

- All tables created via Laravel migrations (villages, schools, projects, donations, volunteers, CMS pages, settings, FAQs, etc.)
- **`database/cmsrr.sql`** — full MySQL dump (schema + seed data) for cPanel import
- **`database/cmsr.sql`** — removed (replaced by `cmsrr.sql`)
- **`CmsrSeeder.php`** — seeds starter data when DB is empty
- **`php artisan cmsr:export-sql`** — regenerates `cmsrr.sql` from the connected database
- **`scripts/cpanel-export-cmsrr.sh`** — run on cPanel to create/refresh `cmsrr.sql` on the server

### 3.3 Mock data removed from homepage

**Problem:** The home page showed fake numbers (248 villages, ₹48.5L+, 4 hardcoded “Needs support” projects) even when the database was empty or API failed.

**Fix:**
- Home page **no longer falls back to demo data** when the API fails
- Demo data only loads if `VITE_USE_DEMO_DATA=true` (dev only; production build has this off)
- **“Our real numbers”** section reads live counts from DB: villages, schools, donations, volunteers, total amount raised
- **“Needs support now”** section reads from DB: `projects` table + admin “Need Support” settings
- If DB is empty → shows `0` or hides empty sections (not fake data)

### 3.4 Starter seed data (real DB content, not mock fallback)

After seeding, the homepage shows **real database records**:

| Content | Count / details |
|---------|-----------------|
| Villages | Kondapur, Rajapet, Rampur |
| Schools | ZPHS Kondapur, Model Primary School Rampur |
| Projects | Water Harvest, Digital Classroom, Green Drive, Computer Lab |
| Volunteers | 3 sample volunteers |
| Donations | 4 successful donations (~₹67,500 total) |
| Programs | 8 programs (Village Development, School Empowerment, etc.) |
| CMS pages | 7 About pages |
| Team groups | 5 groups |
| FAQs | 2 sample FAQs |
| Admin user | `test@gmail.com` / `testadmin123` |

You can edit or delete all of this from the admin panel.

### 3.5 Bilingual English + Telugu

- Migration adds `{field}_te` columns on content tables
- Admin forms use **BilingualField** — every text field has English + Telugu
- Public site language toggle shows Telugu when set, falls back to English
- Applied to: CMS pages, programs, teams, news, stories, partners, villages, projects, FAQs, need-support, active-works (templates, cards, pages), settings

### 3.6 Admin panel improvements

- **AdminUrlField** — auto public URL + editable slug on create forms
- **FAQ CRUD** — full create/edit/delete in admin
- **Need Support** admin — manage homepage “Needs support now” cards
- **Active Works** — templates, cards, and pages with Telugu fields
- **Video URL** on CMS pages (migration added)
- Admin create works when DB starts empty (schema/migrations aligned)

### 3.7 cPanel deployment automation

| Script | Purpose |
|--------|---------|
| `scripts/cpanel-deploy.sh` | Pull code, write `.env`, `composer install`, migrate, link `public_html`, cache config |
| `scripts/cpanel-export-cmsrr.sh` | Export or rebuild DB → `database/cmsrr.sql` |

Also documented in **`CPANEL_DEPLOY.md`** (shorter quick-reference).

### 3.8 Git pushes completed

Latest commits on branch **`laravel`** (remote **`cmsr`**):

| Commit | Description |
|--------|-------------|
| `f2149f9` | Stop mock data fallback; seed real starter content; updated `cmsrr.sql` |
| `66216fe` | Bilingual admin, `cmsrr.sql`, cPanel export script, volunteer registration |
| `5f47834` | Git-only deploy workflow |
| `7a6e727` | MySQL index length fix for cPanel |
| `c483a23` | Composer lock PHP 8.3, public_html linking |

**Production frontend build** (`public/build/`) is committed to Git so cPanel does not need Node.js.

---

## 4. Project Folder Structure (Important Paths)

```
gramunnati-app/
├── app/                          # Laravel backend (controllers, models)
├── database/
│   ├── migrations/               # All table definitions
│   ├── seeders/CmsrSeeder.php    # Starter data
│   └── cmsrr.sql                 # Full SQL dump for cPanel import
├── public/
│   └── build/                    # Compiled React (in Git)
├── resources/js/
│   ├── CmsrApp.jsx               # Main React app + routes
│   ├── api/home.js               # Homepage data from DB
│   ├── api/needsSupport.js       # Need-support projects
│   ├── data/demoData.js          # Demo mode only (off in production)
│   ├── components/admin/         # Admin UI components
│   └── pages/admin/              # Admin pages
├── routes/api.php                # REST API for React
├── scripts/
│   ├── cpanel-deploy.sh          # Deploy on server
│   └── cpanel-export-cmsrr.sh    # Create cmsrr.sql on server
├── CPANEL_DEPLOY.md              # Short deploy reference
└── info.md                       # This file
```

---

## 5. Database Tables (in cmsrr.sql)

All tables are created by migrations and included in `cmsrr.sql`:

**Core:** `users`, `profiles`, `roles`, `user_roles`, `settings`

**Geography:** `states`, `districts`, `mandals`

**Content:** `villages`, `schools`, `projects`, `project_categories`, `programs`, `cms_pages`, `faqs`, `team_groups`, `team_members`, `partners`, `news`, `events`, `success_stories`, `testimonials`, `galleries`, `beneficiaries`

**Engagement:** `donations`, `donation_receipts`, `volunteers`, `volunteer_activities`, `contact_messages`, `notifications`

**Other:** `activity_logs`, `impact_metrics`, `audit_logs`, `village_needs`, `school_requirements`, etc.

Telugu columns (`*_te`) and `video_url` on CMS pages are included.

---

## 6. Admin Login (after seed)

| Field | Value |
|-------|-------|
| URL | https://cmsr.in/admin/login |
| Email | `test@gmail.com` |
| Password | `testadmin123` |

Change this password after first login in production.

---

## 7. What To Do Next — Deploy on cPanel

Follow these steps **in order**. Replace `YOUR_DB_PASSWORD` with your actual MySQL password for user `cmsr_user`.

### Step A — One-time: clone repo on cPanel (if not done yet)

Open **cPanel → Terminal**:

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/cmsr.git cmsr
cd ~/cmsr
git config credential.helper store
```

When Git asks for password → use a **GitHub Personal Access Token** (not your GitHub password).

### Step B — Create all tables + seed data (choose ONE option)

#### Option 1 — Recommended: migrations + seed via script

This **drops all existing tables** in `cmsr_db` and rebuilds everything:

```bash
cd ~/cmsr
git pull origin laravel
CMSRR_CONFIRM=1 DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-export-cmsrr.sh --seed
```

Then deploy the app:

```bash
DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-deploy.sh
```

#### Option 2 — Import SQL via phpMyAdmin

1. cPanel → **phpMyAdmin** → select database **`cmsr_db`**
2. **Import** → choose file **`/home/cmsr/cmsr/database/cmsrr.sql`**
3. In Terminal:

```bash
cd ~/cmsr
git pull origin laravel
DEPLOY_MARK_MIGRATIONS=1 DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-deploy.sh
```

#### Option 3 — Import SQL via Terminal (if `mysql` CLI works)

```bash
cd ~/cmsr
git pull origin laravel
mysql -u cmsr_user -p cmsr_db < database/cmsrr.sql
DEPLOY_MARK_MIGRATIONS=1 DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-deploy.sh
```

### Step C — Verify the site works

Open in browser:

- https://cmsr.in/
- https://cmsr.in/up
- https://cmsr.in/api/health
- https://cmsr.in/admin/login

**Homepage checks:**
- “Our real numbers” should show **real counts** from DB (not 248/512 mock numbers)
- “Needs support now” should show **projects from DB** (4 seeded projects after fresh seed)
- Language toggle should show Telugu where `_te` fields are filled in admin

### Step D — Ongoing updates (after every code change on PC)

**On your PC** (PowerShell):

```powershell
cd c:\Users\USER\Downloads\village_project1\gramunnati-app
npm run build
git add -A
git add -f public/build
git commit -m "Describe your change"
git push cmsr laravel
```

**On cPanel Terminal:**

```bash
cd ~/cmsr
git pull origin laravel
DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-deploy.sh
```

---

## 8. cPanel Requirements Checklist

| Requirement | Setting |
|-------------|---------|
| PHP version | **8.3 or 8.4** (cPanel MultiPHP Manager → cmsr.in) |
| MySQL database | `cmsr_db` |
| MySQL user | `cmsr_user` with full privileges on `cmsr_db` |
| Document root | Linked to `~/cmsr/public` (deploy script handles `public_html` symlink) |
| `.env` | Created automatically by `cpanel-deploy.sh` — **never commit `.env` to Git** |
| Node.js on server | **Not required** — `public/build/` is in Git |

---

## 9. Local Development (your PC)

```powershell
cd c:\Users\USER\Downloads\village_project1\gramunnati-app
composer install
npm install
npm run build
php artisan migrate:fresh --seed
php artisan serve
```

Open http://127.0.0.1:8000

To regenerate `cmsrr.sql` locally after DB changes:

```powershell
php artisan migrate:fresh --seed --force
php artisan cmsr:export-sql
```

---

## 10. Environment Variables

### Server `.env` (created by deploy script)

| Variable | Production value |
|----------|------------------|
| `DB_CONNECTION` | `mysql` |
| `DB_DATABASE` | `cmsr_db` |
| `DB_USERNAME` | `cmsr_user` |
| `DB_PASSWORD` | Your cPanel MySQL password |
| `APP_URL` | `https://cmsr.in` |

### Build-time (baked into `public/build/`)

| Variable | Value |
|----------|-------|
| `VITE_USE_DEMO_DATA` | **`false`** — never enable on production |

---

## 11. Troubleshooting

| Problem | Solution |
|---------|----------|
| Still seeing mock numbers (248 villages, etc.) | Run `git pull` on server + redeploy; old JS bundle was cached. Hard-refresh browser (Ctrl+F5). |
| Homepage shows all zeros | DB empty — run Option 1 or 2 in Step B to seed data. |
| 500 error / white page | Check `~/cmsr/storage/logs/laravel.log`; ensure PHP 8.3+ and `vendor/` exists (`composer install`). |
| Admin login fails | Re-run seed or check `users` table; default: `test@gmail.com` / `testadmin123`. |
| API errors | Verify `.env` DB credentials; test `https://cmsr.in/api/health`. |
| Tables missing | Import `cmsrr.sql` or run `CMSRR_CONFIRM=1 ... cpanel-export-cmsrr.sh --seed`. |

---

## 12. What Is NOT in Git (server-only)

| Item | Why |
|------|-----|
| `.env` | Contains secrets |
| `vendor/` | Created by `composer install` on server |
| `node_modules/` | Not needed on server |

---

## 13. Quick Command Reference

```bash
# Pull latest + deploy
cd ~/cmsr && git pull origin laravel && DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-deploy.sh

# Rebuild DB from scratch + export cmsrr.sql
CMSRR_CONFIRM=1 DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-export-cmsrr.sh --seed

# Backup current DB to cmsrr.sql (no delete)
DEPLOY_DB_PASSWORD='YOUR_DB_PASSWORD' bash scripts/cpanel-export-cmsrr.sh
```

---

## 14. Summary

| Done | Status |
|------|--------|
| Laravel + React CMSR platform | ✅ Complete |
| MySQL database + migrations | ✅ Complete |
| `cmsrr.sql` for cPanel | ✅ Complete |
| Mock data removed from homepage | ✅ Fixed |
| Bilingual EN + TE admin | ✅ Complete |
| Admin panel + need-support + FAQs | ✅ Complete |
| cPanel deploy scripts | ✅ Complete |
| Pushed to GitHub (`cmsr` / `laravel`) | ✅ Done |

| Your next action | Command |
|------------------|---------|
| **Deploy on cPanel** | `git pull` → seed/import DB → `bash scripts/cpanel-deploy.sh` |
| **Verify site** | Open https://cmsr.in and admin login |
| **Change admin password** | After first login |
| **Add real content** | Use admin panel to replace seed data |

For a shorter deploy-only reference, see **`CPANEL_DEPLOY.md`**.
