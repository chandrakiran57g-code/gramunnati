# Admin Panel Guide

Complete reference for the CMSR admin CMS at `/admin`.

---

## Access

| | |
|--|--|
| **URL** | `https://yourdomain.com/admin/login` |
| **Default email** | `test@gmail.com` |
| **Default password** | `testadmin123` |

**Requirements:**

1. Admin user must exist in **Supabase Auth** (same email/password)
2. `supabase/admin-policies.sql` must be executed

Change default credentials before production.

---

## Sidebar structure

```
Dashboard
Navbar Manager
  ├── About Us
  ├── Teams
  ├── Member List
  ├── What We Do (Programs)
  ├── Partner Organisations
  └── Gallery
Active Works
  ├── Templates
  ├── Cards
  └── Detail Pages
Need Support
Donations
  ├── All Donations
  └── Receipts
Communication (Messages)
Volunteers
Stories & News
  ├── Success Stories
  └── News
Reports
Settings
```

Route definitions: `resources/js/lib/adminRoutes.js`  
Sidebar config: `resources/js/lib/adminNavConfig.js`

---

## Navbar Manager

Controls content linked from the public navigation bar.

### About Us (`/admin/nav/about-us`)

- Create/edit CMS pages shown under About Us dropdown
- Each page gets a public URL: `/page/{slug}`
- Auto-generated slug from title (advanced edit available)

### Teams (`/admin/nav/teams`)

- Team groups and members
- Public: `/teams`, `/teams/{slug}`

### Member List (`/admin/nav/member-list`)

- Registered platform members
- Public: `/members` (auto-listed)

### What We Do (`/admin/nav/programs`)

- Development program pillars
- Public: `/programs`, `/programs/{slug}`

### Partner Organisations (`/admin/nav/partners`)

- Partner logos and links
- Public: `/partners`

### Gallery (`/admin/nav/gallery`)

- Photo/video collections
- Upload to Supabase Storage
- Public: `/gallery`

---

## Active Works

Homepage feature sections showing villages, schools, programs, and custom entity types.

### Templates (`/admin/active-works/templates`)

Create **entity types** (like built-in Village and School):

| Field | Description |
|-------|-------------|
| Template name | e.g. "Temples" |
| Public section title | Auto: "Active Temples" |
| Icon | Emoji shown on homepage |
| Sort order | Section position on homepage |
| Status | Active / Inactive |
| URL | Auto-generated from name; advanced edit available |

**Built-in (cannot delete):** Village, School

Each custom template creates a homepage section: **Active {Name}**

### Cards (`/admin/active-works/cards`)

Create homepage cards for any template from the Templates list:

| Field | Description |
|-------|-------------|
| Title | Card heading |
| Template | Dropdown — only templates from Templates section |
| Cover image | Upload or URL |
| Description | Card text |
| Sort order | Order within section |
| Status | Active / Inactive |
| Public URL | Auto-generated slug |

**Note:** Villages and schools from the database also appear automatically in Active Villages / Active Schools sections.

### Detail Pages (`/admin/active-works/pages`)

Build full detail pages for CMS cards:

- Overview, statistics, impact metrics
- Gallery, timeline, development scores
- Program-specific fields for program templates

Public URL: `/active-work/{slug}`

---

## Need Support (`/admin/need-support`)

Manage urgent donation project cards on the homepage:

- Project name, description, cover image
- Target amount / raised amount
- Category (program type)
- Public list: `/need-support`

Changes appear on homepage without refresh (live update).

---

## Donations

### All Donations (`/admin/donations`)

View and manage donation records from Supabase.

### Receipts (`/admin/receipts`)

Generate and manage donation receipts.

---

## Communication (`/admin/communication`)

View contact form messages and inquiries.

---

## Volunteers (`/admin/volunteers`)

Manage volunteer registrations and profiles.

---

## Stories & News

| Section | Public URL |
|---------|------------|
| Success Stories | `/stories`, `/stories/{slug}` |
| News | `/news`, `/news/{slug}` |

---

## Reports (`/admin/reports`)

Analytics dashboard — donations, engagement, platform stats.

---

## Settings (`/admin/settings`)

Site-wide configuration stored in Supabase settings table.

---

## Live updates

When you save content in admin, the public site updates **without refresh**:

- Same browser tab: `CustomEvent`
- Other tabs: `localStorage` sync

Implementation: `resources/js/lib/platformRefresh.js` + `hooks/usePlatformRefresh.js`

Affected areas: homepage Active Works, Need Support, navbar data, gallery.

---

## Legacy URL redirects

Old admin URLs redirect automatically via `AdminLegacyRedirect.jsx`:

| Old URL | Redirects to |
|---------|--------------|
| `/admin/villages` | Active Works Detail Pages |
| `/admin/cms` | About Us |
| `/admin/homepage` | Active Works Cards |
| `/admin/users` | (legacy — check redirect map) |

Full map: `resources/js/pages/admin/AdminLegacyRedirect.jsx`

---

## File uploads

Component: `resources/js/components/admin/AdminMediaUpload.jsx`

- Primary: Supabase Storage upload
- Fallback: paste image URL directly

Requires `gallery-storage.sql` executed in Supabase.

---

## Common workflows

### Add a new homepage section type

1. **Templates** → Create template (e.g. "Hospitals")
2. **Cards** → Create cards with template "Hospitals"
3. Homepage shows **Active Hospitals** section automatically

### Add a village to Active Works

Option A: Create card in **Cards** with Village template  
Option B: Add village in database — appears automatically in Active Villages

### Publish a new About page

1. **Navbar Manager → About Us** → Create page
2. Set status Active
3. Page appears in About Us dropdown at `/page/{slug}`

---

## Related docs

- [Supabase Setup](./SUPABASE_SETUP.md)
- [Project Analysis — Features](./PROJECT_ANALYSIS.md#8-major-features)
- [Architecture — Active Works data flow](./ARCHITECTURE.md#5-data-architecture)
