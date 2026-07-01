# GramUnnati Documentation

Complete documentation for the **gramunnati-app** project (Laravel + Inertia + React + Supabase).

| Document | Description |
|----------|-------------|
| [Project Analysis](./PROJECT_ANALYSIS.md) | Full codebase analysis — stack, features, data flow, risks |
| [Architecture](./ARCHITECTURE.md) | System design, routing model, request lifecycle |
| [Local Development](./LOCAL_DEVELOPMENT.md) | Run the app locally with hot reload |
| [Supabase Setup](./SUPABASE_SETUP.md) | Database, auth, RLS policies, storage |
| [Admin Panel Guide](./ADMIN_GUIDE.md) | Admin routes, CMS features, Active Works |
| [cPanel Deployment](./CPANEL_DEPLOYMENT.md) | Production deployment on shared hosting |

## Quick links

- **GitHub:** `https://github.com/chandrakiran57g-code/gramunnati.git` (branch: `laravel`)
- **Sibling project:** `../village_project` — standalone Vite SPA (branch: `main`)
- **Production URL:** Set `APP_URL` in `.env` to your domain

## Project summary

GramUnnati is a rural development platform for villages, schools, programs, donations, and volunteer engagement. The **gramunnati-app** version wraps the original React SPA in a thin **Laravel 13** shell so it can run on **cPanel / Apache** hosting. All business data lives in **Supabase**; Laravel handles HTTP delivery and asset serving only.
