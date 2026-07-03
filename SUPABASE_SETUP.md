# Cynda Supabase Setup Guide

## Prerequisites
- A Supabase account (https://supabase.com)
- A new Supabase project

## Step-by-Step Setup

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** > **New Query**
3. Copy and paste the entire contents of `supabase/complete_setup.sql`
4. Click **Run** to execute the SQL

### 2. Storage Buckets Setup

Create these buckets in the Supabase Dashboard:

1. Go to **Storage**
2. Click **New bucket**
3. Create two buckets:
   - `files` (Private bucket for company documents)
   - `avatars` (Public bucket for user avatars)

4. Set up policies:
   - For `avatars` bucket: Enable public access for reading
   - For `files` bucket: Keep it private

### 3. Email Templates Setup

1. Go to **Authentication** > **Email Templates**
2. Update each template with the corresponding HTML:
   - **Confirm signup**: Use `email-confirmation-template.html`
   - **Reset password**: Use `password-reset-template.html`
   - **Magic Link**: Use `magic-link-template.html`
   - **Invite user**: Use `invite-email-template.html`

3. Make sure to keep the template variables like `{{ .ConfirmationURL }}` intact!

### 4. Auth Settings

1. Go to **Authentication** > **Providers** > **Email**
2. Enable email provider
3. Set **Site URL** to your frontend URL (e.g., `http://localhost:5173` for development, or your production URL)
4. Add redirect URLs:
   - `http://localhost:5173/**`
   - `https://your-domain.com/**`

### 5. Environment Variables

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings:
- Go to **Project Settings** > **API**
- Copy `Project URL` and `anon public` key

### 6. Edge Functions (Optional)

If you want to use the edge functions:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Deploy functions: `supabase functions deploy`

## Demo Data Setup

After creating your first user:

1. Go to **SQL Editor** > **New Query**
2. Open `supabase/demo_data.sql`
3. Replace `YOUR_USER_EMAIL` and `YOUR_USER_ID` with your actual email and user ID
4. Run the query to populate sample data

## Project Structure

```
supabase/
├── complete_setup.sql          # Complete database setup (run this first)
├── demo_data.sql               # Sample demo data
├── 01_auth_and_profiles.sql    # Individual migration files
├── 02_business_and_staff.sql
├── 03_crm.sql
├── 04_finance.sql
├── 05_projects.sql
├── 07_storage.sql
├── 08_super_admin_updates.sql
├── 09_feature_waitlist.sql
├── 10_super_admin_management_and_codes.sql
├── 11_super_admin_global_access_and_migration.sql
├── migrations/                 # Database migrations
└── functions/                  # Edge functions
    └── welcome-email/
        └── index.ts
```

## Database Tables Overview

### Core Tables
- `profiles` - User profiles and authentication data
- `businesses` - Company/business information
- `staff` - Team members and employees
- `invitations` - Invitation tokens for new users

### CRM Module
- `crm_companies` - Companies/accounts
- `crm_contacts` - Contacts at companies
- `crm_deals` - Sales deals and opportunities
- `company_messages` - Email templates and messages

### Finance Module
- `invoices` - Client invoices
- `expenses` - Business expenses
- `transactions` - Payment transactions
- `subscription_reminders` - Subscription notifications

### Projects Module
- `projects` - Projects and initiatives
- `tasks` - Tasks and todo items

### Admin & Billing
- `redemption_codes` - Promo codes and coupons
- `feature_waitlist` - Feature request waitlist

## Security Features

- **Row Level Security (RLS)** - All tables have RLS enabled
- **Multi-tenancy** - Data is isolated by business
- **Super Admin Access** - Limited to 5 super admin accounts
- **Audit Trails** - `created_at` and `updated_at` on all tables

## Troubleshooting

### RLS Policy Issues
- Make sure your profile has a `business_id` set
- Check that you're authenticated

### Email Templates Not Working
- Verify template variables are present
- Check Supabase Auth logs for errors

### Storage Upload Issues
- Ensure bucket policies are set correctly
- Check that your profile has a `business_id`

## Next Steps

1. Test the signup flow
2. Try the forgot password feature
3. Test email confirmation
4. Explore the CRM, Finance, and Projects modules
5. Set up your first business and team!
