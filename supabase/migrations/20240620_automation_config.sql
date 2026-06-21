-- Migration for automation configuration storage
-- This migration creates tables to store automation configurations and run logs

-- Active Automations Configuration
CREATE TABLE IF NOT EXISTS active_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  run_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Run Logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  automation_id UUID REFERENCES active_automations(id),
  automation_name TEXT NOT NULL,
  trigger_event TEXT,
  affected_record TEXT,
  outcome TEXT NOT NULL,
  gemini_call BOOLEAN DEFAULT FALSE,
  error_reason TEXT,
  prompt_context JSONB,
  response_received TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Timing Configurations
CREATE TABLE IF NOT EXISTS automation_timing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  automation_id UUID REFERENCES active_automations(id),
  timing_type TEXT NOT NULL, -- 'schedule', 'relative', 'interval'
  timing_value TEXT NOT NULL, -- cron expression, relative time, or interval
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_automations_business_id ON active_automations(business_id);
CREATE INDEX IF NOT EXISTS idx_active_automations_template_id ON active_automations(template_id);
CREATE INDEX IF NOT EXISTS idx_active_automations_status ON active_automations(status);

CREATE INDEX IF NOT EXISTS idx_automation_logs_business_id ON automation_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id ON automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_automation_logs_outcome ON automation_logs(outcome);

CREATE INDEX IF NOT EXISTS idx_automation_timing_configs_business_id ON automation_timing_configs(business_id);
CREATE INDEX IF NOT EXISTS idx_automation_timing_configs_automation_id ON automation_timing_configs(automation_id);

-- Row Level Security
ALTER TABLE active_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_timing_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own active automations" ON active_automations
  FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Users can insert their own active automations" ON active_automations
  FOR INSERT WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update their own active automations" ON active_automations
  FOR UPDATE USING (business_id = auth.uid());

CREATE POLICY "Users can delete their own active automations" ON active_automations
  FOR DELETE USING (business_id = auth.uid());

CREATE POLICY "Users can view their own automation logs" ON automation_logs
  FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Users can insert their own automation logs" ON automation_logs
  FOR INSERT WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can view their own timing configs" ON automation_timing_configs
  FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Users can insert their own timing configs" ON automation_timing_configs
  FOR INSERT WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update their own timing configs" ON automation_timing_configs
  FOR UPDATE USING (business_id = auth.uid());
