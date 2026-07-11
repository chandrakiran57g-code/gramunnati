-- Run this in Supabase SQL Editor to allow admin writes and public reads.
-- Create the admin user in Authentication first: test@gmail.com / testadmin123

-- CMS pages use enum content_status_type: 'active' | 'inactive' (NOT published/draft)
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published cms pages" ON cms_pages;
CREATE POLICY "Public read active cms pages" ON cms_pages
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Admin full access cms pages" ON cms_pages;
CREATE POLICY "Admin full access cms pages" ON cms_pages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings (navigation config, site settings)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin write settings" ON settings;
CREATE POLICY "Admin write settings" ON settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Team groups & members
ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active team groups" ON team_groups;
CREATE POLICY "Public read active team groups" ON team_groups
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Admin full access team groups" ON team_groups;
CREATE POLICY "Admin full access team groups" ON team_groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- team_members uses is_active (boolean), NOT status
DROP POLICY IF EXISTS "Public read team members" ON team_members;
CREATE POLICY "Public read team members" ON team_members
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access team members" ON team_members;
CREATE POLICY "Admin full access team members" ON team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active programs" ON programs;
CREATE POLICY "Public read active programs" ON programs
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Admin full access programs" ON programs;
CREATE POLICY "Admin full access programs" ON programs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Villages, schools, projects (admin CRUD)
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read villages" ON villages;
CREATE POLICY "Public read villages" ON villages
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin villages" ON villages;
CREATE POLICY "Admin villages" ON villages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read schools" ON schools;
CREATE POLICY "Public read schools" ON schools
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin schools" ON schools;
CREATE POLICY "Admin schools" ON schools
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin projects" ON projects;
CREATE POLICY "Admin projects" ON projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Partners, beneficiaries, news, events, stories, galleries
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read partners" ON partners;
CREATE POLICY "Public read partners" ON partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin partners" ON partners;
CREATE POLICY "Admin partners" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read beneficiaries" ON beneficiaries;
CREATE POLICY "Public read beneficiaries" ON beneficiaries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin beneficiaries" ON beneficiaries;
CREATE POLICY "Admin beneficiaries" ON beneficiaries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read news" ON news;
CREATE POLICY "Public read news" ON news FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "Admin news" ON news;
CREATE POLICY "Admin news" ON news FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "Admin events" ON events;
CREATE POLICY "Admin events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read stories" ON success_stories;
CREATE POLICY "Public read stories" ON success_stories FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "Admin stories" ON success_stories;
CREATE POLICY "Admin stories" ON success_stories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read galleries" ON galleries;
CREATE POLICY "Public read galleries" ON galleries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin galleries" ON galleries;
CREATE POLICY "Admin galleries" ON galleries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact messages, profiles (admin read)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert contact" ON contact_messages;
CREATE POLICY "Anyone insert contact" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admin contact messages" ON contact_messages;
CREATE POLICY "Admin contact messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin profiles" ON profiles;
CREATE POLICY "Admin profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Donations, volunteers, notifications, audit logs
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin donations" ON donations;
CREATE POLICY "Admin donations" ON donations FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin volunteers" ON volunteers;
CREATE POLICY "Admin volunteers" ON volunteers FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin notifications" ON notifications;
CREATE POLICY "Admin notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin audit logs" ON audit_logs;
CREATE POLICY "Admin audit logs" ON audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Impact metrics, project categories, activity logs, donation receipts
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read impact metrics" ON impact_metrics;
CREATE POLICY "Public read impact metrics" ON impact_metrics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin impact metrics" ON impact_metrics;
CREATE POLICY "Admin impact metrics" ON impact_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read project categories" ON project_categories;
CREATE POLICY "Public read project categories" ON project_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin project categories" ON project_categories;
CREATE POLICY "Admin project categories" ON project_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read activity logs" ON activity_logs;
CREATE POLICY "Public read activity logs" ON activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin activity logs" ON activity_logs;
CREATE POLICY "Admin activity logs" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin donation receipts" ON donation_receipts;
CREATE POLICY "Admin donation receipts" ON donation_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default navigation config if missing
INSERT INTO settings (key, value)
VALUES ('nav_config', '{"items":[{"key":"about-us","label":"About Us","type":"dropdown","enabled":true,"order":0,"source":"cms","navGroup":"about_us"},{"key":"teams","label":"Teams","type":"dropdown","enabled":true,"order":1,"source":"team_groups"},{"key":"what-we-do","label":"What We Do","type":"dropdown","enabled":true,"order":2,"source":"programs"},{"key":"member-list","label":"Member List","type":"link","enabled":true,"order":3,"path":"/members"},{"key":"partners","label":"Partner Organizations","type":"link","enabled":true,"order":4,"path":"/partners"},{"key":"gallery","label":"Gallery","type":"link","enabled":true,"order":5,"path":"/gallery"},{"key":"contact","label":"Contact Us","type":"link","enabled":true,"order":6,"path":"/contact"}]}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value)
VALUES ('cms_nav_groups', '{}')
ON CONFLICT (key) DO NOTHING;

-- ─── Additional policies (see also setup-remaining.sql) ───
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active faqs" ON faqs;
CREATE POLICY "Public read active faqs" ON faqs FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admin faqs" ON faqs;
CREATE POLICY "Admin faqs" ON faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read featured testimonials" ON testimonials;
CREATE POLICY "Public read featured testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (is_featured = true);
DROP POLICY IF EXISTS "Admin testimonials" ON testimonials;
CREATE POLICY "Admin testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read documents" ON documents;
CREATE POLICY "Public read documents" ON documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin documents" ON documents;
CREATE POLICY "Admin documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read states" ON states;
CREATE POLICY "Public read states" ON states FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public read districts" ON districts;
CREATE POLICY "Public read districts" ON districts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public read mandals" ON mandals;
CREATE POLICY "Public read mandals" ON mandals FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone insert contact" ON contact_messages;
CREATE POLICY "Anyone insert contact" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert donations" ON donations;
CREATE POLICY "Public insert donations" ON donations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Village followers & crops
ALTER TABLE village_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read village followers" ON village_followers;
CREATE POLICY "Public read village followers" ON village_followers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users manage own village follows" ON village_followers;
CREATE POLICY "Users manage own village follows" ON village_followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own village follows" ON village_followers;
CREATE POLICY "Users delete own village follows" ON village_followers FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin village followers" ON village_followers;
CREATE POLICY "Admin village followers" ON village_followers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read village crops" ON village_crops;
CREATE POLICY "Public read village crops" ON village_crops FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin village crops" ON village_crops;
CREATE POLICY "Admin village crops" ON village_crops FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE school_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read school followers" ON school_followers;
CREATE POLICY "Public read school followers" ON school_followers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users manage own school follows" ON school_followers;
CREATE POLICY "Users manage own school follows" ON school_followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own school follows" ON school_followers;
CREATE POLICY "Users delete own school follows" ON school_followers FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin school followers" ON school_followers;
CREATE POLICY "Admin school followers" ON school_followers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read school requirements" ON school_requirements;
CREATE POLICY "Public read school requirements" ON school_requirements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin school requirements" ON school_requirements;
CREATE POLICY "Admin school requirements" ON school_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
