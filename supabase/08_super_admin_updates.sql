-- Update to support Super Admin and Mandatory Password Reset flow
-- Run this in the Supabase SQL Editor

-- 1. ADD NEW COLUMN TO PROFILES
-- Tracks if a user needs to change their password on next login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS needs_password_reset BOOLEAN DEFAULT FALSE;

-- 2. UPDATE HANDLE NEW USER FUNCTION
-- Ensure new users created via metadata can have the needs_password_reset flag set
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    chat_name, 
    role, 
    user_type, 
    needs_password_reset
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    new.email,
    COALESCE(new.raw_user_meta_data->>'chat_name', LOWER(REPLACE(new.raw_user_meta_data->>'full_name', ' ', '.')) || '.cynda'),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'solo'),
    COALESCE((new.raw_user_meta_data->>'needs_password_reset')::BOOLEAN, FALSE)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENHANCE RLS FOR SUPER ADMINS
-- Allow Super Admins to view all profiles for customer service and search
CREATE POLICY "Super Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Super Admin'
  )
);

-- Allow Super Admins to update profiles (e.g., for password reset flags)
CREATE POLICY "Super Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Super Admin'
  )
);

-- 4. ENSURE INITIAL SUPER ADMIN (Optional/Example)
-- If you need to manually promote a user to Super Admin:
-- UPDATE public.profiles SET role = 'Super Admin' WHERE email = 'your-email@example.com';
