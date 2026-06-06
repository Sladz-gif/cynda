-- 09_feature_waitlist.sql
-- Table to store "Notify Me" / "Let me know" requests for upcoming features

CREATE TABLE IF NOT EXISTS public.feature_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  whatsapp TEXT, -- Optional WhatsApp number
  feature_id TEXT NOT NULL, -- e.g., 'v1.2-email', 'ai-cofounder', 'marketplace'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional if user is logged in
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feature_waitlist ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can sign up for the waitlist (insert)
CREATE POLICY "Anyone can join waitlist" 
ON public.feature_waitlist FOR INSERT 
WITH CHECK (true);

-- 2. Only Super Admins can view the waitlist
CREATE POLICY "Super Admins can view waitlist" 
ON public.feature_waitlist FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Super Admin'
  )
);

-- 3. Only Super Admins can delete from waitlist
CREATE POLICY "Super Admins can delete from waitlist" 
ON public.feature_waitlist FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Super Admin'
  )
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.feature_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_feature ON public.feature_waitlist(feature_id);

