-- supabase/migrations/20260621_edge_functions_setup.sql
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Example: Schedule contact-birthday function daily at 9 AM UTC
-- After deploying the edge function, replace the URL with your actual function URL
-- SELECT cron.schedule(
--   'contact-birthday-daily',
--   '0 9 * * *',
--   $$
--   SELECT
--     net.http_post(
--       url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/contact-birthday',
--       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR-SERVICE-ROLE-KEY"}'::jsonb,
--       body := '{}'::jsonb
--     )
--   $$
-- );

-- Example: Database Webhook for welcome-email
-- Go to Supabase Dashboard > Database > Webhooks to create this, pointing to your welcome-email function URL
