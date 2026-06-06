-- 03_crm.sql
-- Run this third

-- 1. CRM COMPANIES
CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  status TEXT DEFAULT 'Lead',
  size TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRM CONTACTS
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

-- 3. CRM DEALS
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC(15,2) DEFAULT 0,
  stage TEXT DEFAULT 'Qualified', -- 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'
  probability INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active',
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Isolated by business_id)

-- Companies
CREATE POLICY "CRM Companies isolation" ON public.crm_companies FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_companies.business_id));

-- Contacts
CREATE POLICY "CRM Contacts isolation" ON public.crm_contacts FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_contacts.business_id));

-- Deals
CREATE POLICY "CRM Deals isolation" ON public.crm_deals FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.crm_deals.business_id));

-- 5. AUTO-UPDATE TRIGGERS
CREATE TRIGGER update_crm_companies_modtime BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_crm_contacts_modtime BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_crm_deals_modtime BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
