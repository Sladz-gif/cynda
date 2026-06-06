-- 04_finance.sql
-- Run this fourth

-- 1. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY, -- e.g., INV-001
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Paid', 'Pending', 'Overdue', 'Draft'
  due_date DATE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Approved', 'Pending', 'Rejected'
  merchant TEXT,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES

-- Invoices
CREATE POLICY "Finance Invoices isolation" ON public.invoices FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.invoices.business_id));

-- Expenses
CREATE POLICY "Finance Expenses isolation" ON public.expenses FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id = public.expenses.business_id));

-- 4. AUTO-UPDATE TRIGGERS
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_expenses_modtime BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
