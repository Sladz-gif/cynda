-- 02_business_and_staff.sql
-- Run this second

-- 1. BUSINESSES TABLE
-- Stores company-wide information
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link profiles to businesses
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 2. STAFF TABLE
-- Stores employees/team members within a business
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Linked once they sign up
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  chat_name TEXT,
  role TEXT NOT NULL DEFAULT 'Employee', -- 'Director', 'Manager', 'Employee'
  department TEXT,
  tools TEXT[] DEFAULT '{}', -- List of accessible modules
  status TEXT DEFAULT 'Pending', -- 'Active', 'Pending', 'Inactive'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, email)
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 3. INVITATIONS TABLE
-- Stores tokens for onboarded staff who need to set passwords
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

-- 4. RLS POLICIES

-- Businesses: Owner and staff can view their business
CREATE POLICY "Users can view their business" 
ON public.businesses FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.businesses.id)
);

-- Businesses: Only owner can update business info
CREATE POLICY "Owners can update business" 
ON public.businesses FOR UPDATE 
USING (auth.uid() = owner_id);

-- Staff: Users can view staff in their own business
CREATE POLICY "Users can view business staff" 
ON public.staff FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.staff.business_id)
);

-- Staff: Only admins/directors can manage staff
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

-- 5. AUTO-UPDATE TRIGGERS
CREATE TRIGGER update_businesses_modtime BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_staff_modtime BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
