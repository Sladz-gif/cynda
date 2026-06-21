-- OPTIONAL, reference only. The Dashboard Webhooks UI (see
-- docs/supabase_webhooks_setup.md) is the recommended path  this file
-- shows the equivalent raw SQL if you ever want webhooks fully
-- version-controlled in migrations instead of dashboard config.
--
-- Requires the pg_net extension (enabled by default on Supabase).

create or replace function notify_automation_service()
returns trigger as $$
declare
    payload jsonb;
begin
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', to_jsonb(NEW),
        'old_record', case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end
    );

    perform net.http_post(
        url := 'https://your-automation-service.example.com/webhooks/supabase',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Webhook-Secret', current_setting('app.settings.webhook_secret', true)
        ),
        body := payload
    );

    return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_crm_deals_won_kickoff
    after update on crm_deals
    for each row
    when (NEW.stage = 'Closed Won' and OLD.stage is distinct from 'Closed Won')
    execute function notify_automation_service();

create trigger trg_staff_new_hire
    after insert on staff
    for each row
    execute function notify_automation_service();

-- Set the secret once per database (or via Supabase Vault for better
-- secret hygiene):
-- alter database postgres set app.settings.webhook_secret = 'your-secret';
