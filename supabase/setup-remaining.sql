-- Run in Supabase SQL Editor AFTER admin-policies.sql and gallery-storage.sql
-- Completes RLS for remaining tables + optional public form policies

-- ─── FAQs ─────────────────────────────────────────────
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active faqs" ON faqs;
CREATE POLICY "Public read active faqs" ON faqs
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admin faqs" ON faqs;
CREATE POLICY "Admin faqs" ON faqs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Testimonials ─────────────────────────────────────
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read featured testimonials" ON testimonials;
CREATE POLICY "Public read featured testimonials" ON testimonials
  FOR SELECT TO anon, authenticated USING (is_featured = true);

DROP POLICY IF EXISTS "Admin testimonials" ON testimonials;
CREATE POLICY "Admin testimonials" ON testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Documents ────────────────────────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read documents" ON documents;
CREATE POLICY "Public read documents" ON documents
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin documents" ON documents;
CREATE POLICY "Admin documents" ON documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Geo lookup tables (public read) ──────────────────
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read states" ON states;
CREATE POLICY "Public read states" ON states FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read districts" ON districts;
CREATE POLICY "Public read districts" ON districts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read mandals" ON mandals;
CREATE POLICY "Public read mandals" ON mandals FOR SELECT TO anon, authenticated USING (true);

-- ─── Contact messages — ensure public can submit ──────
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert contact" ON contact_messages;
CREATE POLICY "Anyone insert contact" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin contact messages" ON contact_messages;
CREATE POLICY "Admin contact messages" ON contact_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Donations — allow anonymous pending donations ────
DROP POLICY IF EXISTS "Public insert donations" ON donations;
CREATE POLICY "Public insert donations" ON donations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ─── Site settings defaults (non-payment) ─────────────
INSERT INTO settings (key, value) VALUES
  ('contact_phone', '+91 98765 43210'),
  ('contact_address', 'Hyderabad, Telangana, India')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
WHERE settings.value IS NULL OR settings.value = '';
