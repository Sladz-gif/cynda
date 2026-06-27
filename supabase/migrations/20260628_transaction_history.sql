-- Add missing columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'solo';

-- Transaction history table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  paystack_reference TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL, -- Monthly or Annual
  credits_awarded INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = profile_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = profile_id);
