# Subscription Reminders Setup Guide

## Step 1: Apply the Database Migration

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260627_subscription_expiry_and_reminders.sql` and run it

## Step 2: Deploy the Edge Function

1. Make sure you have the Supabase CLI installed
2. From the project root directory run:
   ```bash
   supabase functions deploy subscription-reminders
   ```

## Step 3: Set Up the Cron Job

1. In your Supabase dashboard go to **Database** → **Cron Jobs**
2. Click **New Cron Job**
3. Configure it:
   - **Name**: Send Subscription Reminders
   - **Schedule**: Daily at 09:00 (pick your preferred time)
   - **Type**: Edge Function
   - **Function to trigger**: `subscription-reminders`
4. Save it!

## Step 4: Update Subscription Expiry on Payment

When a user successfully pays, update their `subscription_expires_at` in `profiles` table! For example (in `CheckoutPage.tsx`):
- If monthly plan: set `expiry = NOW() + INTERVAL '1 month'`
- If annual plan: set `expiry = NOW() + INTERVAL '1 year'`
