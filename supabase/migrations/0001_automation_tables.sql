-- Cynda automation engine: supporting tables.
-- Run this against your existing Supabase project. Adjusted to match your actual schema!

-- Audit trail for every automation execution (powers the Activity feed)
create table if not exists automation_runs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    automation_key text not null,
    triggered boolean not null,
    summary text not null,
    actions_taken jsonb default '[]'::jsonb,
    artifact jsonb,
    error text,
    duration_ms integer,
    created_at timestamptz not null default now()
);
create index if not exists idx_automation_runs_business on automation_runs (business_id, created_at desc);
create index if not exists idx_automation_runs_key on automation_runs (automation_key, created_at desc);

-- LLM-drafted CRM follow-ups, pending human review before sending
create table if not exists deal_drafts (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    deal_id uuid not null references crm_deals(id) on delete cascade,
    kind text not null,
    draft_text text not null,
    status text not null default 'pending_review', -- pending_review | approved | rejected | sent
    created_at timestamptz not null default now()
);
create index if not exists idx_deal_drafts_business on deal_drafts (business_id, status);

-- LLM-drafted invoice payment reminders, pending human review
create table if not exists invoice_drafts (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    invoice_id text not null references invoices(id) on delete cascade,
    kind text not null,
    draft_text text not null,
    status text not null default 'pending_review',
    created_at timestamptz not null default now()
);
create index if not exists idx_invoice_drafts_business on invoice_drafts (business_id, status);

-- Suggested project name/summary when a deal closes won
create table if not exists project_suggestions (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    source_deal_id uuid references crm_deals(id) on delete set null,
    suggested_name text not null,
    kickoff_summary text not null,
    status text not null default 'pending_review', -- pending_review | approved | rejected
    created_project_id uuid references projects(id) on delete set null,
    created_at timestamptz not null default now()
);
create index if not exists idx_project_suggestions_business on project_suggestions (business_id, status);

-- Weekly (and future cadence) leadership briefings
create table if not exists briefings (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    kind text not null,
    content text not null,
    week_of date,
    created_at timestamptz not null default now()
);
create index if not exists idx_briefings_business on briefings (business_id, created_at desc);

-- Generic in-app notifications used by several automations
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references businesses(id) on delete cascade,
    user_id uuid references profiles(id) on delete cascade,
    kind text,
    title text not null,
    body text not null,
    read boolean not null default false,
    created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications (user_id, read, created_at desc);

-- Columns the automations read/write on your existing tables.
-- Run these only if the columns don't already exist.
alter table crm_deals add column if not exists last_activity_at timestamptz default now();
alter table crm_deals add column if not exists follow_up_drafted timestamptz;
alter table invoices add column if not exists reminder_drafted_at timestamptz;
alter table staff add column if not exists is_leadership boolean default false;
alter table staff add column if not exists hiring_manager_id uuid references staff(id);
alter table notifications add column if not exists kind text;
alter table notifications add column if not exists business_id uuid references businesses(id) on delete cascade;
alter table notifications add column if not exists user_id uuid references profiles(id) on delete cascade;

-- Now create the unique index (after adding the kind column if needed!)
create unique index if not exists idx_notifications_business_kind on notifications (business_id, kind)
    where kind is not null;

-- Row Level Security: these tables are written exclusively by the
-- automation service (service-role key, bypasses RLS) but READ by
-- end users through the normal Supabase client in the React app.
-- Lock reads down to the user's own business.
alter table automation_runs enable row level security;
alter table deal_drafts enable row level security;
alter table invoice_drafts enable row level security;
alter table project_suggestions enable row level security;
alter table briefings enable row level security;
alter table notifications enable row level security;

create policy "Business members can view automation_runs"
    on automation_runs for select
    using (business_id in (select business_id from profiles where id = auth.uid()));

create policy "Business members can view deal_drafts"
    on deal_drafts for select
    using (business_id in (select business_id from profiles where id = auth.uid()));

create policy "Business members can view invoice_drafts"
    on invoice_drafts for select
    using (business_id in (select business_id from profiles where id = auth.uid()));

create policy "Business members can view project_suggestions"
    on project_suggestions for select
    using (business_id in (select business_id from profiles where id = auth.uid()));

create policy "Business members can view briefings"
    on briefings for select
    using (business_id in (select business_id from profiles where id = auth.uid()));

create policy "Users can view their own notifications"
    on notifications for select
    using (user_id in (select id from profiles where id = auth.uid()));

create policy "Users can mark their own notifications read"
    on notifications for update
    using (user_id in (select id from profiles where id = auth.uid()))
    with check (user_id in (select id from profiles where id = auth.uid()));
