# Your Manual Setup Guide (cPanel)

**Purpose:** Everything **you** must do on cPanel before and during go-live.  
**Coding is complete** — see [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) for what the developer finished vs what you still need to do.

**Domain:** `myvillagemart.com`  
**Estimated time for Step 8:** 20–40 minutes

---

## Progress checklist

```
[x] Step 1 — MySQL database created
[x] Step 2 — Email account created
[x] Step 3 — Domain + SSL ready
[x] Step 4 — Data in MySQL (cmsrr.sql imported — Supabase export skipped)
[ ] Step 5 — Stripe keys (optional — can do later)
[ ] Step 6 — Upload app + create production .env
[ ] Step 7 — Run deploy commands in Terminal
[ ] Step 8 — Set document root to public/
[ ] Step 9 — Test live site
```

> **Next action:** Start at **Step 6** below (or read [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) Section 3).

---

## Step 1 — Create MySQL database

### Why
The website will store villages, schools, donations, CMS content, and users in **your cPanel MySQL** — not Supabase.

### Where
cPanel → search **「MySQL® Databases」** or **「MySQL Database Wizard」**

### Do this

1. **Create a new database**
   - Section: **Create New Database**
   - Name example: `CMSR`  
   - cPanel adds a prefix automatically → full name may look like:  
     `myvillagemart_CMSR`
   - Click **Create Database**

2. **Create a database user**
   - Section: **MySQL Users** → **Add New User**
   - Username example: `CMSR_app`  
   - Full name may look like: `myvillagemart_CMSR_app`
   - Password: use **Generate Password** → **copy and save it** (password manager or secure note)
   - Click **Create User**

3. **Link user to database**
   - Section: **Add User To Database**
   - Select the user and database you just created
   - Click **Add**
   - On privileges screen: check **ALL PRIVILEGES**
   - Click **Make Changes**

### Write down (you will need these later)

| Field | Your value |
|-------|------------|
| Database name | `myvillagemart________` |
| Database username | `myvillagemart________` |
| Database password | `________________` |
| Database host | `localhost` (always this on cPanel) |

> **Tip:** You can also see database info in cPanel → **phpMyAdmin** (left sidebar shows database name).

---

## Step 2 — Create email account (for password reset & notifications)

### Why
When users forget passwords or get notifications, the app sends email **from your domain** — not Supabase.

### Where
cPanel → search **「Email Accounts」**

### Do this

1. Click **Create**
2. Fill in:
   - **Email:** `noreply` (full address: `noreply@yourdomain.com`)
   - **Password:** strong password → save it
   - **Storage:** default is fine
3. Click **Create**

### Optional second address (admin contact)

- `contact@yourdomain.com` — for contact form / admin alerts

### Write down

| Field | Your value |
|-------|------------|
| Email address | `noreply@________________` |
| Email password | `________________` |
| Mail server (SMTP host) | Usually `mail.yourdomain.com` |
| SMTP port (SSL) | Usually `465` |
| SMTP port (TLS) | Usually `587` |

### How to confirm SMTP settings

1. cPanel → **Email Accounts**
2. Find `noreply@...` → click **Connect Devices** or **Configure Mail Client**
3. Note **Incoming/Outgoing Server** — use that as `MAIL_HOST` later

---

## Step 3 — Domain and SSL (Terminal)

### Why
The site must load over **HTTPS**. Laravel will later use the **`public/`** folder — **do not change document root yet**.

### Where
cPanel → **Terminal** (or SSH into your account)

### Do this — copy/paste block

Replace `YOURDOMAIN.com` with your real domain (e.g. `myvillagemart.com`), then run:

```bash
DOMAIN="YOURDOMAIN.com"

# 1) Confirm domain resolves to this server
echo "Domain IP:    $(dig +short "$DOMAIN" | tail -1)"
echo "Server IP:    $(curl -s ifconfig.me)"

# 2) Trigger AutoSSL (cPanel installs free Let's Encrypt cert)
/usr/local/cpanel/bin/autossl_check --user="$(whoami)"

# 3) Check certificate on file (cPanel API)
uapi SSL fetch_best_for_domain domain="$DOMAIN"

# 4) Verify HTTPS is live
echo | openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null \
  | openssl x509 -noout -subject -dates

curl -sI "https://${DOMAIN}" | head -5
```

### Success looks like

- Step 1: **Domain IP** and **Server IP** match (or domain IP is your host’s proxy/CDN IP)
- Step 4: `openssl` shows **notBefore / notAfter** dates (cert exists)
- Step 4: `curl` returns `HTTP/2 200` or `301`/`302` (not connection refused)

### If step 2 fails

Some hosts block AutoSSL from user shell. Run once in cPanel UI instead:

**SSL/TLS Status** → select domain → **Run AutoSSL**

Then re-run only the verify block:

```bash
DOMAIN="YOURDOMAIN.com"
echo | openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null \
  | openssl x509 -noout -subject -dates
curl -sI "https://${DOMAIN}" | head -5
```

### Write down

| Field | Your value |
|-------|------------|
| Live URL | `https://________________` |
| SSL active? | Yes / No |

> **Document root:** Do **not** change yet. After upload we point it to `.../CMSR-app/public`.

---

## Step 4 — Export data from Supabase

### Why
Your existing villages, schools, CMS pages, Active Works cards, etc. live in Supabase today. We need a copy to import into MySQL.

### Where
[https://supabase.com/dashboard](https://supabase.com/dashboard) → your project

### Method A — Export each table as CSV (recommended)

For **each table** below:

1. Left menu → **Table Editor**
2. Click the table name
3. Top right → **Export** (or ⋮ menu → Export to CSV)
4. Save file as `tablename.csv`

### Tables to export (priority order)

**Must export:**

| # | Table name | Contains |
|---|------------|----------|
| 1 | `settings` | Active Works, Need Support, site config |
| 2 | `villages` | Village listings |
| 3 | `schools` | School listings |
| 4 | `projects` | Projects / Need Support |
| 5 | `cms_pages` | About Us / CMS pages |
| 6 | `programs` | What We Do programs |
| 7 | `team_groups` | Team sections |
| 8 | `team_members` | Team people |
| 9 | `partners` | Partner logos |
| 10 | `donations` | Donation records |
| 11 | `volunteers` | Volunteer registrations |
| 12 | `profiles` | User profiles |
| 13 | `galleries` | Gallery images metadata |
| 14 | `news` | News articles |
| 15 | `events` | Events |
| 16 | `success_stories` | Success stories |
| 17 | `states` | States (geo) |
| 18 | `districts` | Districts (geo) |
| 19 | `mandals` | Mandals (geo) |
| 20 | `project_categories` | Project categories |
| 21 | `contact_messages` | Contact form messages (optional) |
| 22 | `beneficiaries` | Beneficiaries (if used) |
| 23 | `faqs` | FAQs (if used) |
| 24 | `testimonials` | Testimonials (if used) |

**If a table is empty or missing — skip it.**

### Method B — Full database backup (advanced)

1. Supabase → **Database** → **Backups**  
   OR use **SQL Editor** with pg_dump if you have CLI access  
2. Save the `.sql` file

### Organize exports

1. Create a folder on your PC: `supabase-export`
2. Put all CSV files inside
3. Zip the folder: `supabase-export.zip`

### Write down

| Field | Your value |
|-------|------------|
| Export done? | Yes / No |
| Number of CSV files | _____ |
| Zip file location | e.g. `Desktop/supabase-export.zip` |

---

## Step 5 — Stripe keys (keep payments)

### Why
Donations use Stripe. We keep this — only the keys move to your server `.env`.

### Where
[https://dashboard.stripe.com](https://dashboard.stripe.com)

### Do this

1. Log in to Stripe
2. Turn on **Test mode** (toggle top-right) — use test keys until go-live
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** → starts with `pk_test_`
   - **Secret key** → click Reveal → starts with `sk_test_`

### Write down

| Field | Your value |
|-------|------------|
| Publishable key | `pk_test________________` |
| Secret key | `sk_test________________` |

> **Security:** Never post secret keys in public chat. Share via private note or password manager.

---

## Step 6 — Send details to developer

When Steps 1–5 are done, send a message with this template (fill in blanks):

```text
Manual setup complete.

Domain: https://________________
MySQL database: myvillagemart________________
MySQL username: myvillagemart________________
MySQL password: [send securely]
MySQL host: localhost

Email: noreply@________________
Email password: [send securely]
SMTP host: mail.________________

Supabase export: ready (___ CSV files / zip attached)
Stripe publishable: pk_test________________
Stripe secret: [send securely]

Start Phase 1 — coding can begin.
```

**What happens next:** Developer builds MySQL schema, Laravel API, email, file storage, and data import. You wait — no coding required from you.

---

## Step 6 — Upload the Laravel app

Coding is done locally. Upload **`CMSR-app`** to cPanel.

### Option A — File Manager (recommended if Git is not updated)

1. On your PC, zip `CMSR-app` (you may exclude `node_modules`, `vendor`, `.git`)
2. cPanel → **File Manager** → upload to `/home/myvillagemart/`
3. Extract → folder path: `/home/myvillagemart/CMSR-app/`

### Option B — Git

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/CMSR.git CMSR-app
cd CMSR-app
```

### Build frontend on your PC first (recommended)

```powershell
cd CMSR-app
npm ci
npm run build
```

Upload the project **including** `public/build/` to the server.

---

## Step 7 — Create `.env` and run deploy commands

Open cPanel → **Terminal**:

```bash
cd ~/CMSR-app
```

Create `.env` via File Manager or `nano .env`. Use the template in [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) Section 3.3 (MySQL + mail + `APP_URL=https://myvillagemart.com`).

Then run:

```bash
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan cmsr:mark-migrations-run
php artisan storage:link
chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> **Important:** Your database already has tables from `cmsrr.sql`.  
> Use **`cmsr:mark-migrations-run`** — do **NOT** run `php artisan migrate --force` or `migrate:fresh`.

> If `npm` fails on server, build on your PC (`npm run build`) and upload `public/build/`.

---

## Step 8 — Set document root

1. cPanel → **Domains**
2. **myvillagemart.com** → Manage / Document Root
3. Set to:

```text
/home/myvillagemart/CMSR-app/public
```

4. Save

---

## Step 9 — Test the live site

Open in browser:

| Test | URL | Expected |
|------|-----|----------|
| Homepage | `https://myvillagemart.com/` | Loads with your data |
| Health | `https://myvillagemart.com/up` | OK / 200 |
| API | `https://myvillagemart.com/api/health` | `{"ok":true}` |
| Admin | `https://myvillagemart.com/admin` | Login page |
| Admin login | `test@gmail.com` / `testadmin123` | Dashboard loads |
| Villages | `https://myvillagemart.com/villages` | List shows |

Report any errors to developer with screenshot + URL.

---

## Troubleshooting (manual steps only)

| Problem | What to try |
|---------|-------------|
| Can't find MySQL Databases | cPanel search bar → type `mysql` |
| Database user can't connect | Re-check ALL PRIVILEGES; username includes prefix |
| Email not sending | Verify SMTP in cPanel Email → Connect Devices |
| SSL not working | Wait 15 min after AutoSSL; clear browser cache |
| Terminal not available | Use SSH with PuTTY (host: your domain, port 22, cPanel user) |
| `composer: command not found` | Run Step 8.4 Composer install |
| `npm: command not found` | Build on PC, upload `public/build/` folder |
| White page after deploy | Check document root is `public/` not project root |
| 500 error | File Manager → `storage/logs/laravel.log` → send last lines to developer |

---

## What you never need to do

- Edit React or Laravel code files
- Run Supabase SQL scripts on cPanel
- Delete Supabase before developer confirms migration success
- Share `.env` or Stripe secret keys publicly

---

## Quick reference — your cPanel environment

| Item | Your server |
|------|-------------|
| PHP | 8.3.31 |
| MySQL | 8.0.46 |
| phpMyAdmin | 5.2.2 |
| DB host | `localhost` |
| Web server | Apache (cpsrvd) |

---

## Related documents

| File | Audience |
|------|----------|
| **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** | **Start here** — done vs todo, full deploy steps |
| [CPANEL_MYSQL_MIGRATION_GUIDE.md](./CPANEL_MYSQL_MIGRATION_GUIDE.md) | Migration background |
| [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) | Technical deploy reference |
| [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | Run on your PC |

---

**You are on Step 6.** Steps 1–4 are complete. Follow Step 6–9 above or [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md).
