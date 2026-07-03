# Git-only deploy — cmsr.in

Everything goes through **GitHub** → **cPanel pull**. No File Manager uploads.

| | |
|---|---|
| **Repo** | `https://github.com/chandrakiran57g-code/cmsr.git` |
| **Branch** | `laravel` |
| **Server path** | `/home/cmsr/cmsr` |

---

## On your PC (after code changes)

```powershell
cd c:\Users\USER\Downloads\village_project1\CMSR-app

npm run build
git add -A
git add -f public/build
git status
git commit -m "Your change description"
git push cmsr laravel
```

> **Never commit `.env`** — it stays on the server only.

---

## On cPanel (after every push)

```bash
cd ~/cmsr
git pull origin laravel
DEPLOY_DB_PASSWORD='CMSR@#121' bash scripts/cpanel-deploy.sh
```

That script automatically:
- Uses PHP 8.3 (`ea-php83`)
- Writes/updates `.env` (DB: `cmsr_db` / user: `cmsr_user`)
- Runs `composer install`
- Runs `php artisan migrate --force` (empty DB) or set `DEPLOY_MARK_MIGRATIONS=1` after SQL import
- Links `public_html` → Laravel `public/`
- Caches config/routes/views

---

## First-time Git setup on cPanel (done once)

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/cmsr.git cmsr
cd ~/cmsr
git config credential.helper store
git remote set-url origin https://github.com/chandrakiran57g-code/cmsr.git
git pull origin laravel
DEPLOY_DB_PASSWORD='CMSR@#121' bash scripts/cpanel-deploy.sh
```

When Git asks for password → paste **GitHub token only** (not commands).

---

## Create `cmsrr.sql` on cPanel Terminal

Generate the SQL file **on the server** (cPanel → Terminal):

### First time — empty DB → seed → create cmsrr.sql

```bash
cd ~/cmsr
git pull origin laravel
CMSRR_CONFIRM=1 DEPLOY_DB_PASSWORD='CMSR@#121' bash scripts/cpanel-export-cmsrr.sh --seed
```

Output: **`~/cmsr/database/cmsrr.sql`**

Admin after seed: `test@gmail.com` / `testadmin123`

### Export only — backup current database (no delete)

```bash
cd ~/cmsr
DEPLOY_DB_PASSWORD='CMSR@#121' bash scripts/cpanel-export-cmsrr.sh
```

Download: cPanel File Manager → `cmsr/database/cmsrr.sql`

---

## Import full data (alternative: phpMyAdmin import)

1. cPanel → phpMyAdmin → `cmsr_db` → Import → **`database/cmsrr.sql`**
2. Then on server:

```bash
cd ~/cmsr
DEPLOY_MARK_MIGRATIONS=1 DEPLOY_DB_PASSWORD='CMSR@#121' bash scripts/cpanel-deploy.sh
```

`cmsrr.sql` includes the full schema (Telugu `_te` columns, `video_url` on CMS pages) plus seed data.

Regenerate on PC: `php artisan migrate:fresh --seed && php artisan cmsr:export-sql`

---

## Test

- `https://cmsr.in/`
- `https://cmsr.in/up`
- `https://cmsr.in/api/health`

---

## What is NOT in Git (generated on server)

| Item | Why |
|------|-----|
| `.env` | Secrets — created by deploy script |
| `vendor/` | Created by `composer install` |
| `node_modules/` | Not needed on server — `public/build/` is in Git |

---

## Quick update cycle

```
PC:  edit code → npm run build → git push cmsr laravel
Server:  git pull → bash scripts/cpanel-deploy.sh
```
