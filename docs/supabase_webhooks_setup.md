
# Wiring Supabase → Automation Service (Event triggers)

Two of the five automations are EVENT-driven and need Supabase to call
the automation service when a row changes:

- **Won deal → project kickoff**: fires on `UPDATE` to `deals`
- **New hire checklist**: fires on `INSERT` to `staff`

Supabase's built-in **Database Webhooks** feature is the cleanest way
to do this (it's a thin wrapper over `pg_net`, no custom SQL trigger
required). Steps:

## 1. Deploy the automation service first
You need a live HTTPS URL before configuring the webhook. Deploy to
Railway/Render/Fly (see `docs/deployment.md`), confirm `GET /health`
returns `{"status": "ok"}`, then continue.

## 2. Create the webhooks in the Supabase Dashboard
Go to **Database → Webhooks → Create a new webhook**, once for each:

### Webhook 1: deals → kickoff
- Name: `deals_won_kickoff`
- Table: `deals`
- Events: `Update` only
- Type: `HTTP Request`
- Method: `POST`
- URL: `https://your-automation-service.example.com/webhooks/supabase`
- Headers: `X-Webhook-Secret: <same value as SUPABASE_WEBHOOK_SECRET in .env>`

### Webhook 2: staff → new hire checklist
- Name: `staff_new_hire`
- Table: `staff`
- Events: `Insert` only
- Type: `HTTP Request`
- Method: `POST`
- URL: same as above
- Headers: same as above

Supabase sends the full row as `record` (and `old_record` on updates),
which is exactly the shape `app/routes/webhooks.py` expects  no
transformation needed.

## 3. Why not a raw Postgres trigger + pg_net instead?
You can do it that way (see `0002_optional_pg_net_trigger.sql` below
for reference), and it's marginally faster since it skips the Supabase
dashboard's webhook-management layer. But the Dashboard UI version is
easier to inspect, pause, and debug without writing SQL, and the
performance difference is irrelevant at this scale. Use the dashboard
version unless you have a specific reason not to.

## 4. Verify
Update a deal's `stage` to `closed_won` in the Supabase table editor.
Within a couple seconds, check:
```sql
select * from automation_runs order by created_at desc limit 5;
```
You should see a `won_deal_project_kickoff` row with `triggered = true`.
