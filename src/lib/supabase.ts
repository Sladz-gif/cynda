import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  profiles: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    role: string;
    created_at: string;
  };
  staff: {
    id: string;
    business_id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    tools: string[];
    created_at: string;
  };
  business_configs: {
    id: string;
    owner_id: string;
    selected_modules: string[];
    tier: string;
    updated_at: string;
  };
};
