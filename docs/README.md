# CMSR Documentation

Complete documentation for **CMSR-app** (Laravel 13 + Inertia + React + **MySQL**).

| Document | Description |
|----------|-------------|
| **[Deployment Status](./DEPLOYMENT_STATUS.md)** | **START HERE** — what’s done, what you did, how to deploy |
| **[Manual Setup Guide](./MANUAL_SETUP_GUIDE.md)** | Your cPanel checklist (Steps 1–9) |
| [cPanel Deployment](./CPANEL_DEPLOYMENT.md) | Technical deploy reference |
| [cPanel MySQL Migration](./CPANEL_MYSQL_MIGRATION_GUIDE.md) | Supabase → MySQL migration overview |
| [Local Development](./LOCAL_DEVELOPMENT.md) | Run the app locally |
| [Project Analysis](./PROJECT_ANALYSIS.md) | Codebase analysis |
| [Architecture](./ARCHITECTURE.md) | System design |
| [Admin Panel Guide](./ADMIN_GUIDE.md) | Admin routes and CMS |

## Quick links

- **GitHub:** `https://github.com/chandrakiran57g-code/CMSR.git` (branch: `laravel`)
- **Production domain:** `https://cmsr.in`
- **Admin login (default):** `test@gmail.com` / `testadmin123` — change after go-live

## Project summary

CMSR is a rural development platform for villages, schools, programs, donations, and volunteer engagement. **CMSR-app** wraps the React SPA in **Laravel 13** for **cPanel / Apache** hosting. All business data lives in **MySQL** on cPanel (migrated from Supabase). Laravel serves the app, API, auth (Sanctum), and file uploads.

## Current status (June 2026)

| Who | Status |
|-----|--------|
| **You (cPanel)** | MySQL, SSL, email, SQL import — done |
| **Developer (code)** | Laravel API, frontend shim, local tests — done |
| **Deploy** | Upload app, `.env`, document root — **your next step** |

See **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** for the full breakdown.
