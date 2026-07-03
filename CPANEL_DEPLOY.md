# cPanel Deploy — cmsr.in (terminal only)

**One command** — paste in cPanel Terminal:

```bash
cd ~/cmsr && git pull origin laravel && DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
```

That script automatically:

1. Pulls latest code from GitHub  
2. Creates `.env` (no File Manager)  
3. Runs `composer install`  
4. Runs `php artisan key:generate`  
5. Runs `php artisan gramunnati:mark-migrations-run`  
6. Runs `storage:link` + permissions + cache  

---

## First time only (if not cloned yet)

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/cmsr.git cmsr
cd ~/cmsr
DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
```

---

## Optional: link `public_html` (if domain points there)

```bash
cd ~/cmsr && git pull origin laravel && DEPLOY_LINK_PUBLIC_HTML=1 DEPLOY_DB_PASSWORD='Gramunnati@#121' bash scripts/cpanel-deploy.sh
```

---

## Custom DB names (if cPanel prefix differs)

```bash
cd ~/cmsr && git pull origin laravel && \
DEPLOY_DB_DATABASE='cmsr_cmsr_db' \
DEPLOY_DB_USERNAME='cmsr_cmsr_db' \
DEPLOY_DB_PASSWORD='Gramunnati@#121' \
bash scripts/cpanel-deploy.sh
```

---

## Test after deploy

| URL | Expected |
|-----|----------|
| `https://cmsr.in/` | Homepage |
| `https://cmsr.in/up` | 200 OK |
| `https://cmsr.in/api/health` | `{"ok":true}` |

---

**No Node.js on cPanel** — `public/build/` is already in Git.
