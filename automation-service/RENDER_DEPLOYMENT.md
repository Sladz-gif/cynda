# Render Deployment Guide

This guide covers deploying the Cynda Automation Service to Render.

## Prerequisites

- Render account (https://render.com)
- Supabase project with required tables
- Frontend deployed (e.g., on Vercel)
- Git repository with the automation service code

## Architecture Overview

The automation service requires a **long-lived process** (not serverless) because:
- APScheduler runs in-memory for cron jobs and polling
- Webhooks need persistent processing
- Background tasks must continue running

**Recommended platforms:** Render, Railway, Fly.io, or a small VPS
**NOT suitable for:** Vercel, Netlify Functions, AWS Lambda (serverless)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains:
- `Procfile` (already included)
- `requirements.txt` (already included)
- `.env.example` (already included)
- All Python files in `automation-service/` directory

### 2. Create Render Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your Git repository
3. Configure build settings:
   - **Root Directory:** `automation-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** (handled by Procfile)

### 3. Configure Environment Variables

Add these environment variables in Render:

#### Required for Production
```bash
# Development mode (set to false in production)
DEV_MODE=false

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Webhook Security
SUPABASE_WEBHOOK_SECRET=generate-a-long-random-string

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Scheduler Configuration
SCHEDULER_TIMEZONE=UTC
```

#### Getting Required Values

**Supabase URL:**
- From Supabase Dashboard → Settings → API → Project URL

**Supabase Service Role Key:**
- From Supabase Dashboard → Settings → API → service_role (secret)
- ⚠️ NEVER use the anon key - this backend needs full access

**Supabase JWT Secret:**
- From Supabase Dashboard → Settings → API → JWT Secret
- Used for verifying authentication tokens from frontend

**Webhook Secret:**
- Generate a secure random string (e.g., using `openssl rand -base64 32`)
- Configure the same secret in Supabase Database Webhooks

**ALLOWED_ORIGINS:**
- Your frontend domain (e.g., `https://your-app.vercel.app`)
- Multiple domains can be comma-separated

### 4. Configure Supabase Webhooks

For each table that has EVENT automations, create a Database Webhook:

1. Go to Supabase Dashboard → Database → Webhooks → New Webhook
2. Configure:
   - **Name:** Cynda Automation Service
   - **Table:** Select table (e.g., `crm_contacts`, `staff`, `invoices`)
   - **Events:** INSERT, UPDATE (as needed)
   - **HTTP Method:** POST
   - **URL:** Your Render service URL + `/webhooks/supabase`
   - **Secret:** Same value as `SUPABASE_WEBHOOK_SECRET` env var

### 5. Deploy

Click "Create Web Service" in Render. The deployment will:
- Install Python dependencies
- Start the FastAPI server
- Initialize the APScheduler
- Register all automation jobs

### 6. Verify Deployment

Check the health endpoint:
```bash
curl https://your-service.onrender.com/health
```

Expected response:
```json
{"status": "ok"}
```

## Post-Deployment Configuration

### Update Frontend Environment Variables

In your frontend (e.g., Vercel), update:
```bash
VITE_API_URL=https://your-service.onrender.com
```

### Test Webhooks

Trigger an event in Supabase (insert a row) and verify:
- Webhook is received by Render service
- Automation runs successfully
- Result is logged in `automation_runs` table

### Monitor Logs

Check Render logs for:
- Scheduler startup: "Scheduler started."
- Automation loading: "Automations loaded."
- Job registration: "Registered poll job for..."
- Webhook processing: Check for errors

## Troubleshooting

### Service Won't Start

**Issue:** Import errors or missing dependencies
**Solution:** Check Render logs, ensure all packages in requirements.txt

### Webhooks Failing

**Issue:** 401 Unauthorized
**Solution:** Verify `SUPABASE_WEBHOOK_SECRET` matches between Render and Supabase

### Scheduler Not Running

**Issue:** Jobs not firing
**Solution:** Check logs for "Scheduler started." message

### Database Connection Issues

**Issue:** Connection refused or timeout
**Solution:** Verify Supabase URL and service role key are correct

### CORS Errors

**Issue:** Frontend can't access API
**Solution:** Update `ALLOWED_ORIGINS` to include your frontend domain

## Scaling Considerations

### Current Limitations

- Single scheduler instance (no horizontal scaling)
- In-memory job storage (jobs lost on restart)
- No persistent job queue

### Future Enhancements

For production scaling, consider:
- Redis for job persistence
- PostgreSQL-based job storage (APScheduler + PostgreSQL)
- Horizontal scaling with distributed locking
- Separate worker processes for heavy automations

## Monitoring and Maintenance

### Health Checks

Render automatically checks the `/health` endpoint. Ensure it returns quickly.

### Log Monitoring

Monitor for:
- Failed automations (check `automation_runs` table for errors)
- Webhook failures
- Scheduler job execution times

### Database Maintenance

- Monitor `automation_runs` table size (consider archival/purging old records)
- Index optimization for frequent queries
- Regular backups via Supabase

## Security Best Practices

1. **Never commit secrets:** Use environment variables only
2. **Rotate keys regularly:** Update Supabase keys periodically
3. **Limit CORS:** Only allow trusted frontend domains
4. **Monitor webhook traffic:** Watch for suspicious webhook activity
5. **Use HTTPS:** Render provides SSL certificates automatically

## Cost Considerations

- **Render Free Tier:** Suitable for development/low usage
- **Render Starter ($7/mo):** Better for production
- **Database costs:** Supabase free tier includes 500MB database
- **Scaling needs:** Consider paid plans as user base grows

## Support

For issues specific to:
- **Render:** https://render.com/docs
- **Supabase:** https://supabase.com/docs
- **FastAPI:** https://fastapi.tiangolo.com
- **APScheduler:** https://apscheduler.readthedocs.io
