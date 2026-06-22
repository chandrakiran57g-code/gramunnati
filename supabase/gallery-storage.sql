-- Run in Supabase SQL Editor after admin-policies.sql
-- Creates public gallery storage bucket for admin photo & video uploads

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ];

DROP POLICY IF EXISTS "Public read gallery files" ON storage.objects;
CREATE POLICY "Public read gallery files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated upload gallery files" ON storage.objects;
CREATE POLICY "Authenticated upload gallery files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated update gallery files" ON storage.objects;
CREATE POLICY "Authenticated update gallery files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated delete gallery files" ON storage.objects;
CREATE POLICY "Authenticated delete gallery files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');
