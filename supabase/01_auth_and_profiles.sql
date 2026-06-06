-- 01_auth_and_profiles.sql
-- Run this first in the Supabase SQL Editor

-- 1. PROFILES TABLE
-- This table stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  chat_name TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'User', -- 'Super Admin', 'Director', 'Manager', 'Employee'
  user_type TEXT NOT NULL DEFAULT 'solo', -- 'solo', 'small-business', 'large-business', 'enterprise'
  phone TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  needs_password_reset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PROFILE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. AUTOMATIC PROFILE CREATION ON SIGNUP
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, chat_name, role, user_type, needs_password_reset)
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

-- Trigger to run the function after a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. HELPER FUNCTIONS
-- Function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
