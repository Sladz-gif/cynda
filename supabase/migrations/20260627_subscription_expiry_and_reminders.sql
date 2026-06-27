-- Add subscription expiry date to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Track which reminders we've already sent to avoid spamming
CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_days INTEGER NOT NULL, -- 7,5,3,2,1
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, reminder_days)
);

-- Enable RLS
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY "Users can view own reminders" 
ON public.subscription_reminders FOR SELECT 
USING (auth.uid() = profile_id);
