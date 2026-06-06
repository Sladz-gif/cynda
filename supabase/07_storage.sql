-- 07_storage.sql
-- Run this last

-- 1. STORAGE BUCKETS
-- Note: These must be created in the Supabase Dashboard "Storage" tab if SQL fails to create them
-- But we can define policies here.

-- 2. POLICIES FOR 'FILES' BUCKET
-- This bucket stores company documents, assets, and project files.

-- Users can upload files if they are authenticated and belong to a business
-- We use the path 'business_id/filename' for isolation
CREATE POLICY "Users can upload to their business folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Users can view files in their own business folder
CREATE POLICY "Users can view their business files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Users can delete their own business files
CREATE POLICY "Users can delete their business files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
);

-- 3. POLICIES FOR 'AVATARS' BUCKET
-- Publicly readable but only owner can update

CREATE POLICY "Public avatars are readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
