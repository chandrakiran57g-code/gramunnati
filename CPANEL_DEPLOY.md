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
cd c:\Users\USER\Downloads\village_project1\gramunnati-app

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
DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
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
DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
```

When Git asks for password → paste **GitHub token only** (not commands).

---

## Import full data (optional)

1. cPanel → phpMyAdmin → `cmsr_db` → Import → `database/gramunnati.sql`
2. Then on server:

```bash
cd ~/cmsr
DEPLOY_MARK_MIGRATIONS=1 DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
```

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
