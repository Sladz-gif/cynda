-- =============================================================================
-- CYNDA COMPLETE SUPABASE SETUP SQL
-- Run this in the Supabase SQL Editor to set up your entire database
-- =============================================================================

-- =============================================================================
-- 1. CORE FUNCTIONS (Always run first)
-- =============================================================================

-- Function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if the current user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Super Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. AUTH AND PROFILES
-- =============================================================================

-- PROFILES TABLE - Stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  chat_name TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'User', -- 'Super Admin', 'Director', 'Manager', 'Employee'
  user_type TEXT NOT NULL DEFAULT 'solo', -- 'solo', 'team', 'organisation', 'enterprise'
  phone TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  needs_password_reset BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'trial',
  subscription_expires_at TIMESTAMPTZ,
  business_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_valid_user_type CHECK (user_type IN ('solo', 'team', 'organisation', 'enterprise'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PROFILE POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_super_admin());

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. BUSINESSES AND STAFF
-- =============================================================================

-- BUSINESSES TABLE - Stores company-wide information
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  config JSONB DEFAULT '{}',
  departments TEXT[] DEFAULT '{}',
  default_roles TEXT[] DEFAULT '{}',
  workspaces TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link profiles to businesses (already added in profiles table definition above)

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- STAFF TABLE - Stores employees/team members within a business
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  chat_name TEXT,
  role TEXT NOT NULL DEFAULT 'Employee',
  department TEXT,
  tools TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, email)
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- INVITATIONS TABLE - Stores tokens for onboarded staff
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Employee',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- BUSINESSES RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view their business" ON public.businesses;
CREATE POLICY "Users can view their business" 
ON public.businesses FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.businesses.id)
);

DROP POLICY IF EXISTS "Owners can update business" ON public.businesses;
CREATE POLICY "Owners can update business" 
ON public.businesses FOR UPDATE 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Super Admins can manage all businesses" ON public.businesses;
CREATE POLICY "Super Admins can manage all businesses"
ON public.businesses
FOR ALL
USING (public.is_super_admin());

-- STAFF RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view business staff" ON public.staff;
CREATE POLICY "Users can view business staff" 
ON public.staff FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.staff.business_id)
);

DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Admins can manage staff" 
ON public.staff FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND business_id = public.staff.business_id 
    AND role IN ('Super Admin', 'Director')
  )
);

DROP POLICY IF EXISTS "Super Admins can manage all staff" ON public.staff;
CREATE POLICY "Super Admins can manage all staff"
ON public.staff
FOR ALL
USING (public.is_super_admin());

-- =============================================================================
-- 4. CRM MODULE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  status TEXT DEFAULT 'Lead',
  size TEXT,
  website TEXT,
  welcome_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Lead',
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC(15,2) DEFAULT 0,
  stage TEXT DEFAULT 'Qualified',
  probability INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active',
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  message_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_messages ENABLE ROW LEVEL SECURITY;

-- CRM RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "CRM Companies isolation" ON public.crm_companies;
CREATE POLICY "CRM Companies isolation" ON public.crm_companies FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_companies.business_id));

DROP POLICY IF EXISTS "CRM Contacts isolation" ON public.crm_contacts;
CREATE POLICY "CRM Contacts isolation" ON public.crm_contacts FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_contacts.business_id));

DROP POLICY IF EXISTS "CRM Deals isolation" ON public.crm_deals;
CREATE POLICY "CRM Deals isolation" ON public.crm_deals FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_deals.business_id));

DROP POLICY IF EXISTS "Company messages isolation" ON public.company_messages;
CREATE POLICY "Company messages isolation" ON public.company_messages FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.company_messages.business_id));

-- SUPER ADMIN CRM POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Super Admins can manage all crm_companies" ON public.crm_companies;
CREATE POLICY "Super Admins can manage all crm_companies" ON public.crm_companies FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can manage all crm_contacts" ON public.crm_contacts;
CREATE POLICY "Super Admins can manage all crm_contacts" ON public.crm_contacts FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can manage all crm_deals" ON public.crm_deals;
CREATE POLICY "Super Admins can manage all crm_deals" ON public.crm_deals FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can manage all company_messages" ON public.company_messages;
CREATE POLICY "Super Admins can manage all company_messages" ON public.company_messages FOR ALL USING (public.is_super_admin());

-- =============================================================================
-- 5. FINANCE MODULE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  due_date DATE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  merchant TEXT,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- FINANCE RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Finance Invoices isolation" ON public.invoices;
CREATE POLICY "Finance Invoices isolation" ON public.invoices FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.invoices.business_id));

DROP POLICY IF EXISTS "Finance Expenses isolation" ON public.expenses;
CREATE POLICY "Finance Expenses isolation" ON public.expenses FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.expenses.business_id));

-- SUPER ADMIN FINANCE POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Super Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Super Admins can manage all invoices" ON public.invoices FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can manage all expenses" ON public.expenses;
CREATE POLICY "Super Admins can manage all expenses" ON public.expenses FOR ALL USING (public.is_super_admin());

-- =============================================================================
-- 6. PROJECTS MODULE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planning',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15,2),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- PROJECTS RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Projects isolation" ON public.projects;
CREATE POLICY "Projects isolation" ON public.projects FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.projects.business_id));

DROP POLICY IF EXISTS "Tasks isolation" ON public.tasks;
CREATE POLICY "Tasks isolation" ON public.tasks FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.tasks.business_id));

-- SUPER ADMIN PROJECTS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Super Admins can manage all projects" ON public.projects;
CREATE POLICY "Super Admins can manage all projects" ON public.projects FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can manage all tasks" ON public.tasks;
CREATE POLICY "Super Admins can manage all tasks" ON public.tasks FOR ALL USING (public.is_super_admin());

-- =============================================================================
-- 7. SUPER ADMIN AND BILLING
-- =============================================================================

-- FEATURE WAITLIST
CREATE TABLE IF NOT EXISTS public.feature_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  whatsapp TEXT,
  feature_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feature_waitlist ENABLE ROW LEVEL SECURITY;

-- FEATURE WAITLIST POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.feature_waitlist;
CREATE POLICY "Anyone can join waitlist" 
ON public.feature_waitlist FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Super Admins can view waitlist" ON public.feature_waitlist;
CREATE POLICY "Super Admins can view waitlist" 
ON public.feature_waitlist FOR SELECT 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can delete from waitlist" ON public.feature_waitlist;
CREATE POLICY "Super Admins can delete from waitlist" 
ON public.feature_waitlist FOR DELETE 
USING (public.is_super_admin());

-- INDEXES FOR WAITLIST
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.feature_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_feature ON public.feature_waitlist(feature_id);

-- REDEMPTION CODES
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- REDEMPTION CODES POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Super Admins can manage redemption codes" ON public.redemption_codes;
CREATE POLICY "Super Admins can manage redemption codes"
ON public.redemption_codes
FOR ALL
USING (public.is_super_admin());

DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.redemption_codes;
CREATE POLICY "Users can view their own redemptions"
ON public.redemption_codes
FOR SELECT
USING (used_by = auth.uid());

-- Function to generate a random alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_random_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem a code
CREATE OR REPLACE FUNCTION public.redeem_code(code_to_redeem TEXT)
RETURNS JSONB AS $$
DECLARE
  code_record RECORD;
BEGIN
  SELECT * INTO code_record
  FROM public.redemption_codes
  WHERE UPPER(code) = UPPER(code_to_redeem) AND is_used = FALSE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'This code is invalid, expired, or already used.'
    );
  END IF;

  UPDATE public.redemption_codes
  SET 
    is_used = TRUE,
    used_by = auth.uid(),
    used_at = NOW(),
    updated_at = NOW()
  WHERE id = code_record.id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Code redeemed successfully! Enjoy your ' || code_record.duration_months || ' months of Pro.',
    'duration_months', code_record.duration_months
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SUBSCRIPTION REMINDERS
CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_days INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, reminder_days)
);

ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTION REMINDERS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view own reminders" ON public.subscription_reminders;
CREATE POLICY "Users can view own reminders" 
ON public.subscription_reminders FOR SELECT 
USING (auth.uid() = profile_id);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  paystack_reference TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  credits_awarded INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

-- =============================================================================
-- 8. SUPER ADMIN LIMITS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_super_admin_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'Super Admin' THEN
    IF (SELECT COUNT(*) FROM public.profiles WHERE role = 'Super Admin' AND id != NEW.id) >= 5 THEN
      RAISE EXCEPTION 'Maximum number of Super Admin accounts (5) reached. Cannot create or promote more super admins.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS limit_super_admins_trigger ON public.profiles;
CREATE TRIGGER limit_super_admins_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_super_admin_limit();

-- =============================================================================
-- 9. AUTO-UPDATE TRIGGERS (For updated_at columns)
-- =============================================================================

-- Profiles
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Businesses
DROP TRIGGER IF EXISTS update_businesses_modtime ON public.businesses;
CREATE TRIGGER update_businesses_modtime BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Staff
DROP TRIGGER IF EXISTS update_staff_modtime ON public.staff;
CREATE TRIGGER update_staff_modtime BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CRM
DROP TRIGGER IF EXISTS update_crm_companies_modtime ON public.crm_companies;
CREATE TRIGGER update_crm_companies_modtime BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_crm_contacts_modtime ON public.crm_contacts;
CREATE TRIGGER update_crm_contacts_modtime BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_crm_deals_modtime ON public.crm_deals;
CREATE TRIGGER update_crm_deals_modtime BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Finance
DROP TRIGGER IF EXISTS update_invoices_modtime ON public.invoices;
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_expenses_modtime ON public.expenses;
CREATE TRIGGER update_expenses_modtime BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Projects
DROP TRIGGER IF EXISTS update_projects_modtime ON public.projects;
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_tasks_modtime ON public.tasks;
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Redemption Codes
DROP TRIGGER IF EXISTS set_redemption_codes_updated_at ON public.redemption_codes;
CREATE TRIGGER set_redemption_codes_updated_at BEFORE UPDATE ON public.redemption_codes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 10. STORAGE BUCKET SETUP (Run in Dashboard or SQL)
-- =============================================================================
-- Note: Buckets are best created in the Supabase Dashboard > Storage
-- But here are the policies:

-- POLICIES FOR 'FILES' BUCKET
-- DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
-- CREATE POLICY "Users can upload to their business folder"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'files' AND
--   (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
-- );

-- DROP POLICY IF EXISTS "Users can view their business files" ON storage.objects;
-- CREATE POLICY "Users can view their business files"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'files' AND
--   (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
-- );

-- DROP POLICY IF EXISTS "Users can delete their business files" ON storage.objects;
-- CREATE POLICY "Users can delete their business files"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'files' AND
--   (storage.foldername(name))[1] = (SELECT business_id::text FROM public.profiles WHERE id = auth.uid())
-- );

-- POLICIES FOR 'AVATARS' BUCKET
-- DROP POLICY IF EXISTS "Public avatars are readable" ON storage.objects;
-- CREATE POLICY "Public avatars are readable"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'avatars');

-- DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- CREATE POLICY "Users can upload their own avatar"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- =============================================================================
-- 12. CHAT & MESSAGING MODULE
-- =============================================================================

-- CHAT CONVERSATIONS (Private DMs, Group Chats, Channels)
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT PARTICIPANTS (Who is in which conversation)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, profile_id)
);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'media', 'voice', 'file')),
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- CHAT RLS POLICIES (Drop existing first)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.chat_conversations;
CREATE POLICY "Users can view their conversations" 
ON public.chat_conversations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
CREATE POLICY "Users can create conversations" 
ON public.chat_conversations FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their group conversations" ON public.chat_conversations;
CREATE POLICY "Users can update their group conversations" 
ON public.chat_conversations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND profile_id = auth.uid()
  )
);

-- CHAT PARTICIPANTS POLICIES
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.chat_participants;
CREATE POLICY "Users can view conversation participants" 
ON public.chat_participants FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_participants.conversation_id 
    AND profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.chat_participants;
CREATE POLICY "Users can add themselves to conversations" 
ON public.chat_participants FOR INSERT 
WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own participant info" ON public.chat_participants;
CREATE POLICY "Users can update their own participant info" 
ON public.chat_participants FOR UPDATE 
USING (profile_id = auth.uid());

-- CHAT MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
CREATE POLICY "Users can send messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
CREATE POLICY "Users can update their own messages" 
ON public.chat_messages FOR UPDATE 
USING (sender_id = auth.uid());

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- AUTO-UPDATE TRIGGERS FOR CHAT
DROP TRIGGER IF EXISTS update_chat_conversations_modtime ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_modtime 
BEFORE UPDATE ON public.chat_conversations 
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_chat_messages_modtime ON public.chat_messages;
CREATE TRIGGER update_chat_messages_modtime 
BEFORE UPDATE ON public.chat_messages 
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- COMPLETE! YOUR DATABASE IS NOW SET UP
-- =============================================================================
