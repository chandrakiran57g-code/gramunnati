# Supabase Setup

Configure Supabase for GramUnnati — database, authentication, Row Level Security, and file storage.

---

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Add to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

4. Rebuild frontend after changing keys: `npm run build`

---

## 2. Create admin user

The admin panel requires a Supabase Auth user for database writes (RLS).

1. Supabase Dashboard → **Authentication → Users**
2. **Add user** (email confirmed):
   - Email: `test@gmail.com`
   - Password: `testadmin123`

**Production:** Change these credentials and update `resources/js/lib/adminAuth.js` (or move credentials to environment variables).

---

## 3. Run SQL scripts (in order)

Open **Supabase Dashboard → SQL Editor** and run each file from the `supabase/` folder:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `admin-policies.sql` | RLS for CMS, settings, villages, schools, donations, etc. |
| 2 | `gallery-storage.sql` | Public `gallery` storage bucket + upload policies |
| 3 | `setup-remaining.sql` | FAQs, testimonials, geo tables, form policies |

### What admin-policies.sql enables

- **Public read** on active/published content for `anon` role
- **Full access** for `authenticated` role (admin Supabase session)
- Tables include: `cms_pages`, `settings`, `team_groups`, `team_members`, `programs`, `villages`, `schools`, `projects`, `donations`, and more

### Verify RLS

After running scripts, test in SQL Editor:

```sql
-- Should return rows as anon (public read)
SELECT key FROM settings LIMIT 5;
```

---

## 4. Storage (gallery uploads)

`gallery-storage.sql` creates:

- Bucket: `gallery` (public read)
- Policies for authenticated uploads

If admin image uploads fail with storage errors, re-run `gallery-storage.sql`.

Upload paths used by admin:

- `gallery/` — general gallery
- `active-works/` — Active Works card covers

---

## 5. Settings store keys

Platform CMS content stored as JSON in `settings` table:

| Key | Content |
|-----|---------|
| `active_work_store` | Active Works categories, cards, entity templates |
| `needs_support_store` | Need Support homepage cards |
| Nav/site config keys | Managed via CMS admin |

Example structure for Active Works:

```json
{
  "categories": [...],
  "items": [...],
  "entity_templates": [
    {
      "id": "tpl-...",
      "name": "Temples",
      "slug": "temples",
      "icon": "🛕",
      "status": "active",
      "display_order": 2
    }
  ]
}
```

---

## 6. Seed demo data (optional)

Local development only:

```bash
# Requires .env.local with Supabase keys (or copy from .env)
npm run seed:platform
```

Script: `scripts/seed-platform-data.js`

---

## 7. Client integration

### Supabase client

`resources/js/api/supabaseClient.js`:

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});
```

### Admin writes

All admin mutations go through:

```javascript
import { adminDbMutation, ensureAdminDbAccess } from '@/lib/adminDb';
```

This ensures an authenticated Supabase session exists before INSERT/UPDATE/DELETE.

---

## 8. Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot sign in to database` | Create admin user in Supabase Auth |
| `new row violates row-level security` | Run `admin-policies.sql` |
| `permission denied for table settings` | Run `admin-policies.sql`; sign in as admin |
| Storage upload 403 | Run `gallery-storage.sql` |
| Empty homepage sections | Check `settings` table has data; verify anon read policies |
| Changes not appearing live | Hard refresh; check `platformRefresh.js` events |

---

## 9. Production security recommendations

1. **Change admin password** from default `testadmin123`
2. **Tighten RLS** — replace `authenticated` blanket policies with policies checking specific admin user ID:

```sql
-- Example: restrict writes to one admin UUID
USING (auth.uid() = 'YOUR-ADMIN-UUID-HERE')
```

3. **Enable Supabase email confirmation** for public registrations
4. **Review anon policies** — ensure no sensitive tables are publicly writable
5. **Rotate anon key** if compromised (requires rebuild)

---

## Related docs

- [Admin Guide](./ADMIN_GUIDE.md)
- [cPanel Deployment](./CPANEL_DEPLOYMENT.md)
- [Architecture — Data flow](./ARCHITECTURE.md#5-data-architecture)
