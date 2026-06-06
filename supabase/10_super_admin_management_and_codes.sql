-- 10_super_admin_management_and_codes.sql
-- New SQL for Super Admin restrictions and Redemption Code system

-- 1. RESTRICT SUPER ADMIN ACCOUNTS TO 5
-- This trigger ensures that no more than 5 users can have the 'Super Admin' role.
CREATE OR REPLACE FUNCTION public.check_super_admin_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if the role is being set to 'Super Admin'
  IF NEW.role = 'Super Admin' THEN
    -- Count existing super admins, excluding the current record if it's an update
    IF (SELECT COUNT(*) FROM public.profiles WHERE role = 'Super Admin' AND id != NEW.id) >= 5 THEN
      RAISE EXCEPTION 'Maximum number of Super Admin accounts (5) reached. Cannot create or promote more super admins.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS limit_super_admins_trigger ON public.profiles;

CREATE TRIGGER limit_super_admins_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_super_admin_limit();


-- 2. REDEMPTION CODES TABLE
-- Allows Super Admins to create codes for pro durations
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

-- Enable RLS
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;


-- 3. RLS POLICIES FOR REDEMPTION CODES
-- Drop existing policies if they exist for clean re-run
DROP POLICY IF EXISTS "Super Admins can manage redemption codes" ON public.redemption_codes;
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.redemption_codes;

-- Super Admins have full access to manage codes
CREATE POLICY "Super Admins can manage redemption codes"
ON public.redemption_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Super Admin'
  )
);

-- Users can see codes they have already redeemed
CREATE POLICY "Users can view their own redemptions"
ON public.redemption_codes
FOR SELECT
USING (used_by = auth.uid());


-- 4. HELPER FUNCTIONS

-- Function to generate a random alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_random_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing chars like 0, O, 1, I, L
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
  -- 1. Find the code and ensure it's not used
  SELECT * INTO code_record
  FROM public.redemption_codes
  WHERE UPPER(code) = UPPER(code_to_redeem) AND is_used = FALSE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'This code is invalid, expired, or already used.'
    );
  END IF;

  -- 2. Prevent Super Admins from redeeming codes if needed (optional)
  -- Or allow anyone to redeem.

  -- 3. Mark the code as used
  UPDATE public.redemption_codes
  SET 
    is_used = TRUE,
    used_by = auth.uid(),
    used_at = NOW(),
    updated_at = NOW()
  WHERE id = code_record.id;

  -- 4. Return success and the duration for the frontend to handle
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Code redeemed successfully! Enjoy your ' || code_record.duration_months || ' months of Pro.',
    'duration_months', code_record.duration_months
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. AUTOMATIC UPDATED_AT TRIGGER FOR REDEMPTION_CODES
DROP TRIGGER IF EXISTS set_redemption_codes_updated_at ON public.redemption_codes;
CREATE TRIGGER set_redemption_codes_updated_at
BEFORE UPDATE ON public.redemption_codes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
