-- 05_projects.sql
-- Run this fifth

-- 1. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planning', -- 'Planning', 'Active', 'On Hold', 'Completed'
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15,2),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'backlog', 'todo', 'in-progress', 'completed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES

-- Projects
CREATE POLICY "Projects isolation" ON public.projects FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.projects.business_id));

-- Tasks
CREATE POLICY "Tasks isolation" ON public.tasks FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.tasks.business_id));

-- 4. AUTO-UPDATE TRIGGERS
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
