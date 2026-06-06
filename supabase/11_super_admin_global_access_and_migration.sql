-- 11_super_admin_global_access_and_migration.sql
-- 1. MIGRATE USER TYPES
-- Standardize user types to: solo, team, organisation, enterprise

-- Update existing records in public.profiles
UPDATE public.profiles
SET user_type = 'team'
WHERE user_type = 'small-business';

UPDATE public.profiles
SET user_type = 'organisation'
WHERE user_type = 'large-business';

-- Add check constraint to ensure only valid user types are used
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_valid_user_type;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_valid_user_type 
CHECK (user_type IN ('solo', 'team', 'organisation', 'enterprise'));


-- 2. ENHANCE BUSINESSES TABLE FOR PROVISIONING
-- Add fields to store pre-configured enterprise settings

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS default_roles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS workspaces TEXT[] DEFAULT '{}';


-- 3. GLOBAL DATABASE ACCESS FOR SUPER ADMINS
-- This section adds RLS policies that allow users with the 'Super Admin' role 
-- to view and manage data across all tenants (cross-tenant access).

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

-- Add Super Admin policies to core tables

-- Profiles: Super Admin can manage all profiles
DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_super_admin());

-- Businesses: Super Admin can manage all businesses
DROP POLICY IF EXISTS "Super Admins can manage all businesses" ON public.businesses;
CREATE POLICY "Super Admins can manage all businesses"
ON public.businesses
FOR ALL
USING (public.is_super_admin());

-- Staff: Super Admin can manage all staff
DROP POLICY IF EXISTS "Super Admins can manage all staff" ON public.staff;
CREATE POLICY "Super Admins can manage all staff"
ON public.staff
FOR ALL
USING (public.is_super_admin());

-- CRM: Super Admin can manage all CRM data (Assuming tables exist from 03_crm.sql)
-- Note: You may need to repeat this pattern for crm_contacts, crm_companies, crm_deals
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_contacts') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all crm_contacts" ON public.crm_contacts;
        CREATE POLICY "Super Admins can manage all crm_contacts" ON public.crm_contacts FOR ALL USING (public.is_super_admin());
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_companies') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all crm_companies" ON public.crm_companies;
        CREATE POLICY "Super Admins can manage all crm_companies" ON public.crm_companies FOR ALL USING (public.is_super_admin());
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_deals') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all crm_deals" ON public.crm_deals;
        CREATE POLICY "Super Admins can manage all crm_deals" ON public.crm_deals FOR ALL USING (public.is_super_admin());
    END IF;
END $$;

-- Finance: Super Admin can manage all finance data (Assuming tables exist from 04_finance.sql)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all invoices" ON public.invoices;
        CREATE POLICY "Super Admins can manage all invoices" ON public.invoices FOR ALL USING (public.is_super_admin());
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all expenses" ON public.expenses;
        CREATE POLICY "Super Admins can manage all expenses" ON public.expenses FOR ALL USING (public.is_super_admin());
    END IF;
END $$;

-- Projects: Super Admin can manage all projects (Assuming tables exist from 05_projects.sql)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all projects" ON public.projects;
        CREATE POLICY "Super Admins can manage all projects" ON public.projects FOR ALL USING (public.is_super_admin());
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        DROP POLICY IF EXISTS "Super Admins can manage all tasks" ON public.tasks;
        CREATE POLICY "Super Admins can manage all tasks" ON public.tasks FOR ALL USING (public.is_super_admin());
    END IF;
END $$;
