# Cynda Edge Functions Guide

This guide explains how to deploy and use the TypeScript/Supabase Edge Functions instead of the Python automation service!

## 1. Prerequisites
- Supabase account
- Supabase CLI installed (optional but recommended)

## 2. Directory Structure
```
supabase/
├── functions/
│   ├── _shared/              # Shared utilities & types
│   │   ├── types.ts          # Base types (TriggerType, BaseAutomation, etc.)
│   │   └── supabase.ts       # Supabase client & CORS helpers
│   ├── welcome-email/        # First converted automation
│   │   └── index.ts
│   ├── contact-birthday/     # Second converted automation
│   │   └── index.ts
│   ├── contact-cleanup/      # Third converted automation
│   │   └── index.ts
│   └── ... (add more here!)
└── migrations/
```

## 3. Converting More Automations (Pattern)
Every Python automation follows this pattern to convert to TypeScript:

### Step 1: Identify the automation type
- **EVENT**: Triggered by Supabase Database Webhook
- **SCHEDULE**: Triggered by Supabase Cron Job
- **POLL**: Triggered by Supabase Cron Job on an interval

### Step 2: Create a new directory in `supabase/functions/<automation-key>/`
Use the snake_case key from Python as the directory name (e.g., `lead-scoring` for `lead_scoring.py`)

### Step 3: Copy the pattern
Use one of the existing automations as a template!
- For EVENT: Use `welcome-email` as template
- For SCHEDULE: Use `contact-birthday` as template
- For POLL: Use `contact-cleanup` as template

### Step 4: Update the logic
Copy the logic from the Python `run()` and helper functions into TypeScript!

## 4. Deploying Edge Functions
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Edge Functions
2. Click "New Function"
3. Follow the instructions to deploy (or use Supabase CLI: `supabase functions deploy <function-name>`)

## 5. Setting Up Webhooks (for EVENT automations)
1. Go to Supabase Dashboard → Database → Webhooks
2. Click "New Webhook"
3. Configure:
   - Name: e.g., "Welcome Email"
   - Table: e.g., `crm_companies`
   - Events: INSERT/UPDATE/DELETE (as per Python `listens_to_event`)
   - Type of Webhook: HTTP Request
   - URL: Your Edge Function URL
   - HTTP Method: POST
   - Headers: Add `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
4. Save!

## 6. Setting Up Cron Jobs (for SCHEDULE/POLL automations)
1. Make sure the `pg_cron` extension is enabled (run the migration!)
2. Use SQL to schedule, e.g.:
   ```sql
   SELECT cron.schedule(
     'contact-birthday-daily',
     '0 9 * * *', -- Daily at 9 AM UTC
     $$
     SELECT
       net.http_post(
         url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/contact-birthday',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer <YOUR-SERVICE-ROLE-KEY>'
         ),
         body := '{}'::jsonb
       )
     $$
   );
   ```

## 7. Updating the Frontend
- Update frontend API calls to use Supabase Edge Functions instead of the Python service!
- For functions that need to be called from the frontend, you can use `supabase.functions.invoke()`!
