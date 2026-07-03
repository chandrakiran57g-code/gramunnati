# GramUnnati — cPanel + MySQL Migration Action Plan

**Your situation (confirmed):**

| Item | Your answer |
|------|-------------|
| Hosting | cPanel + domain linked |
| Database | MySQL 8.0.46 (`myvillagemart@localhost`) |
| PHP | 8.3.31 |
| SSH | Available (use cPanel Terminal if unsure) |
| Composer | Not installed yet — OK, we handle this |
| Domain | Ready |
| Supabase data | **Migrate existing data** |
| Email | **Yes** — password reset + notifications |
| Stripe | **Keep** |
| File storage | Unlimited — use cPanel `storage/` |

---

## Important: read this first

Today the app talks **directly from the browser to Supabase** (~200+ calls).  
To use **MySQL on cPanel**, we must:

1. Build a **Laravel API** (server-side) that reads/writes MySQL
2. Rewrite the React `api/*.js` files to call `/api/...` instead of Supabase
3. Move **auth** to Laravel (login, register, password reset emails)
4. Move **file uploads** to Laravel `storage/app/public`
5. **Export** your Supabase data → **import** into MySQL
6. Deploy on cPanel with document root = `public/`

This is a **major backend migration** (several days of development).  
You **cannot** simply upload the current project and remove Supabase env vars — the site will break.

---

## Two tracks — what YOU do vs what CODE needs

### Track A — You do now (cPanel setup, no coding)

Do these **before or while** development happens.

#### Step A1 — Create MySQL database (cPanel)

1. Log in to **cPanel**
2. Open **MySQL® Databases**
3. Create database: e.g. `myvillagemart_gramunnati`
4. Create user: e.g. `myvillagemart_app` with a **strong password**
5. **Add user to database** → grant **ALL PRIVILEGES**
6. Save these four values (you will need them in `.env`):

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=myvillagemart_gramunnati
DB_USERNAME=myvillagemart_app
DB_PASSWORD=your_strong_password_here
```

#### Step A2 — Create email account for the app (cPanel)

For password reset and notifications:

1. cPanel → **Email Accounts**
2. Create: e.g. `noreply@yourdomain.com`
3. Note SMTP settings (cPanel → **Email Accounts** → **Connect Devices**):

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=email_account_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="GramUnnati"
```

#### Step A3 — Point domain to Laravel `public/` folder

1. cPanel → **Domains** → your domain
2. Set **Document Root** to:

```
/home/myvillagemart/gramunnati-app/public
```

(Adjust path to where you upload the project.)

#### Step A4 — Enable SSL (HTTPS)

1. cPanel → **SSL/TLS Status** or **Let's Encrypt**
2. Enable certificate for your domain
3. Force HTTPS (optional in `public/.htaccess`)

#### Step A5 — Export Supabase data (save for later import)

In [Supabase Dashboard](https://supabase.com/dashboard):

1. **Table Editor** → for each important table → Export as CSV  
   OR use **Database → Backups** / SQL dump if available

**Priority tables to export:**

- `villages`, `schools`, `projects`, `project_categories`
- `settings` (Active Works + Need Support JSON)
- `cms_pages`, `programs`, `team_groups`, `team_members`
- `partners`, `news`, `events`, `success_stories`
- `donations`, `volunteers`, `profiles`, `users` (auth users need special handling)
- `galleries`, `documents`
- `states`, `districts`, `mandals`

Store CSV/SQL files safely — we import after MySQL schema is created.

#### Step A6 — Stripe keys (keep payments)

From [Stripe Dashboard](https://dashboard.stripe.com):

```env
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Use **test keys** until go-live.

---

### Track B — Development (must be done in code)

These phases are in `implementation_plan.md`. **Do not deploy to production until Track B is complete.**

| Phase | Work | Result |
|-------|------|--------|
| **1** | Laravel MySQL migrations (~35 tables) | Database schema in cPanel MySQL |
| **2** | Laravel Models + API controllers + `routes/api.php` | Server API replaces Supabase |
| **3** | Laravel Sanctum auth + password reset emails | Login/register/reset via your domain |
| **4** | Local file storage + upload API | Images in `storage/app/public` |
| **5** | Rewrite all `resources/js/api/*.js` | Frontend calls Laravel only |
| **6** | Data import scripts (Supabase → MySQL) | Your existing content preserved |
| **7** | Remove Supabase package + rebuild | Clean production build |
| **8** | cPanel deploy + test | Live site |

---

## After code is ready — deployment steps (you + terminal)

Use **cPanel → Terminal** (search "Terminal" in cPanel).  
If Terminal is not available, use **SSH** from PuTTY on Windows.

### Step 1 — Upload project

Upload `gramunnati-app` folder via **File Manager** or **Git**:

```bash
cd ~
git clone -b laravel https://github.com/chandrakiran57g-code/gramunnati.git gramunnati-app
cd gramunnati-app
```

### Step 2 — Install Composer (one-time on server)

```bash
cd ~
curl -sS https://getcomposer.org/installer | php
mkdir -p ~/bin
mv composer.phar ~/bin/composer
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
composer --version
```

### Step 3 — Configure environment

```bash
cd ~/gramunnati-app
cp .env.example .env
nano .env   # or edit via cPanel File Manager
```

Set at minimum:

```env
APP_NAME=GramUnnati
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=myvillagemart_gramunnati
DB_USERNAME=myvillagemart_app
DB_PASSWORD=...

MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=...
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com

STRIPE_KEY=...
STRIPE_SECRET=...
VITE_STRIPE_PUBLISHABLE_KEY=...
```

Generate app key:

```bash
php artisan key:generate
```

### Step 4 — Install PHP dependencies

```bash
composer install --optimize-autoloader --no-dev
```

### Step 5 — Create database tables

```bash
php artisan migrate --force
```

### Step 6 — Import Supabase data

(After migration import command is built in Phase 6):

```bash
php artisan gramunnati:import-supabase --path=storage/imports
```

Upload your CSV exports to `storage/imports/` first.

### Step 7 — File storage link

```bash
php artisan storage:link
```

Uploaded images will be at `https://yourdomain.com/storage/uploads/...`

### Step 8 — Build frontend

**Option A — Build on server** (if Node.js available in Terminal):

```bash
npm ci
npm run build
```

**Option B — Build on your PC, upload `public/build/`** (easier if Node not on server):

```bash
# On your Windows PC
cd gramunnati-app
npm ci
npm run build
# Upload public/build/ folder via File Manager
```

### Step 9 — Permissions

```bash
chmod -R 775 storage bootstrap/cache
```

### Step 10 — Cache for production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 11 — Create admin user

```bash
php artisan gramunnati:create-admin
# OR via tinker after seeders exist
```

### Step 12 — Verify

| URL | Expected |
|-----|----------|
| `https://yourdomain.com/` | Homepage with MySQL data |
| `https://yourdomain.com/admin/login` | Admin login |
| `https://yourdomain.com/up` | Laravel health check 200 |
| Register → forgot password | Email received |

---

## What changes for you as admin

| Today (Supabase) | After migration (cPanel) |
|------------------|--------------------------|
| Admin: `test@gmail.com` hardcoded in JS | Admin user in MySQL with role |
| Login also needs Supabase Auth user | Login via Laravel only |
| Images in Supabase Storage | Images on your server `/storage/` |
| Data in Supabase cloud | Data in your MySQL |
| No server-side security | Laravel middleware protects `/api/admin` |

---

## Recommended order of work

```
Week 1–2 (development)
├── Phase 1: MySQL migrations
├── Phase 2: API controllers
├── Phase 3: Auth + email
└── Phase 4: File uploads

Week 2–3 (development)
├── Phase 5: Frontend API rewrite
├── Phase 6: Supabase data import tool
└── Phase 6: Test locally with MySQL

Week 3 (your cPanel)
├── Track A steps (database, email, domain, SSL)
├── Deploy (steps above)
├── Import Supabase CSV data
└── Go live + test Stripe + test emails
```

---

## If you deploy NOW without migration

| Will work | Will NOT work |
|-----------|---------------|
| Laravel serves HTML shell | All data (villages, CMS, donations) |
| Static UI may flash | Admin save, login, uploads |
| | Stripe checkout (needs API) |

**Do not remove Supabase env vars until Phase 5 is complete.**

---

## Next step

Reply in chat: **"Start Phase 1"** — we begin MySQL migrations and Laravel API in the codebase.

Bring to that session:

1. MySQL database name, username (from Step A1)
2. Your domain name
3. Confirmation Supabase CSV exports are done (Step A5)

---

## Related docs

- [implementation_plan.md](../../implementation_plan.md) — full technical phases
- [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) — current Supabase-based deploy (interim)
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) — current architecture
