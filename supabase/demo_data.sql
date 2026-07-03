-- =============================================================================
-- CYNDA DEMO DATA SQL
-- Use this to populate your database with sample data for demonstrations
-- =============================================================================

-- NOTE: Run this AFTER running complete_setup.sql and creating at least one user

-- =============================================================================
-- 1. FIRST - Create a business for your demo user
-- Replace 'YOUR_USER_EMAIL' with your actual email address first!
-- =============================================================================

-- First, let's find your user ID (run this separately first)
-- SELECT id, email FROM public.profiles WHERE email = 'YOUR_USER_EMAIL';

-- Then insert a business using that ID
-- INSERT INTO public.businesses (owner_id, name, industry)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'Demo Corp',
--   'Technology'
-- );

-- Then update your profile to link to this business
-- UPDATE public.profiles 
-- SET business_id = (SELECT id FROM public.businesses WHERE name = 'Demo Corp'),
--     role = 'Director'
-- WHERE email = 'YOUR_USER_EMAIL';

-- =============================================================================
-- 2. DEMO CRM DATA
-- =============================================================================

-- First, get the business_id from the businesses table
-- Replace 'YOUR_USER_EMAIL' and run this:
-- WITH user_business AS (SELECT business_id FROM public.profiles WHERE email = 'YOUR_USER_EMAIL')

-- Insert demo companies
-- INSERT INTO public.crm_companies (business_id, name, industry, status, size, website)
-- VALUES
--   ((SELECT business_id FROM user_business), 'Acme Inc', 'Manufacturing', 'Customer', 'Enterprise', 'https://acme.example.com'),
--   ((SELECT business_id FROM user_business), 'TechStart', 'Technology', 'Lead', 'Startup', 'https://techstart.example.com'),
--   ((SELECT business_id FROM user_business), 'Global Services', 'Consulting', 'Opportunity', 'Large', 'https://globalservices.example.com'),
--   ((SELECT business_id FROM user_business), 'Local Shop', 'Retail', 'Lead', 'Small', 'https://localshop.example.com');

-- Insert demo contacts
-- INSERT INTO public.crm_contacts (business_id, company_id, name, email, phone, status)
-- VALUES
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'Acme Inc'), 'John Smith', 'john@acme.example.com', '+1234567890', 'Lead'),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'TechStart'), 'Sarah Johnson', 'sarah@techstart.example.com', '+1234567891', 'Customer'),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'Global Services'), 'Mike Brown', 'mike@globalservices.example.com', '+1234567892', 'Lead'),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'Local Shop'), 'Lisa Davis', 'lisa@localshop.example.com', '+1234567893', 'Opportunity');

-- Insert demo deals
-- INSERT INTO public.crm_deals (business_id, company_id, contact_id, title, value, stage, probability, status, expected_close_date)
-- VALUES
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'Acme Inc'), (SELECT id FROM public.crm_contacts WHERE name = 'John Smith'), 'Enterprise License', 50000.00, 'Negotiation', 80, 'active', CURRENT_DATE + INTERVAL '30 days'),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'TechStart'), (SELECT id FROM public.crm_contacts WHERE name = 'Sarah Johnson'), 'Startup Package', 5000.00, 'Closed Won', 100, 'active', CURRENT_DATE),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.crm_companies WHERE name = 'Global Services'), (SELECT id FROM public.crm_contacts WHERE name = 'Mike Brown'), 'Consulting Project', 25000.00, 'Proposal', 50, 'active', CURRENT_DATE + INTERVAL '60 days');

-- =============================================================================
-- 3. DEMO STAFF DATA
-- =============================================================================

-- Insert demo staff members
-- INSERT INTO public.staff (business_id, name, email, role, department, status)
-- VALUES
--   ((SELECT business_id FROM user_business), 'Jane Wilson', 'jane@democorp.com', 'Manager', 'Sales', 'Active'),
--   ((SELECT business_id FROM user_business), 'Bob Miller', 'bob@democorp.com', 'Employee', 'Engineering', 'Active'),
--   ((SELECT business_id FROM user_business), 'Alice Lee', 'alice@democorp.com', 'Employee', 'Marketing', 'Pending');

-- =============================================================================
-- 4. DEMO PROJECTS DATA
-- =============================================================================

-- Insert demo projects
-- INSERT INTO public.projects (business_id, name, description, status, start_date, end_date, budget, owner_id)
-- VALUES
--   ((SELECT business_id FROM user_business), 'Website Redesign', 'Complete overhaul of company website', 'Active', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 15000.00, (SELECT id FROM public.profiles WHERE email = 'YOUR_USER_EMAIL')),
--   ((SELECT business_id FROM user_business), 'Mobile App', 'Develop new mobile application', 'Planning', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '180 days', 50000.00, (SELECT id FROM public.profiles WHERE email = 'YOUR_USER_EMAIL'));

-- Insert demo tasks
-- INSERT INTO public.tasks (business_id, project_id, title, description, status, priority, due_date, tags)
-- VALUES
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Design Homepage', 'Create new homepage design', 'in-progress', 'high', CURRENT_DATE + INTERVAL '7 days', ARRAY['design', 'urgent']),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Setup Development', 'Set up development environment', 'completed', 'medium', CURRENT_DATE, ARRAY['devops']),
--   ((SELECT business_id FROM user_business), (SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Write Content', 'Create website content', 'todo', 'medium', CURRENT_DATE + INTERVAL '14 days', ARRAY['content']);

-- =============================================================================
-- 5. DEMO FINANCE DATA
-- =============================================================================

-- Insert demo invoices
-- INSERT INTO public.invoices (id, business_id, client_id, client_name, amount, status, due_date, items)
-- VALUES
--   ('INV-001', (SELECT business_id FROM user_business), (SELECT id FROM public.crm_contacts WHERE name = 'Sarah Johnson'), 'TechStart', 5000.00, 'Paid', CURRENT_DATE - INTERVAL '15 days', '[{"description": "Consulting Services", "quantity": 10, "rate": 500}]'::jsonb),
--   ('INV-002', (SELECT business_id FROM user_business), (SELECT id FROM public.crm_contacts WHERE name = 'John Smith'), 'Acme Inc', 15000.00, 'Pending', CURRENT_DATE + INTERVAL '15 days', '[{"description": "Software License", "quantity": 1, "rate": 15000}]'::jsonb);

-- Insert demo expenses
-- INSERT INTO public.expenses (business_id, category, amount, status, merchant, description, date)
-- VALUES
--   ((SELECT business_id FROM user_business), 'Software', 299.00, 'Approved', 'Adobe', 'Creative Cloud subscription', CURRENT_DATE - INTERVAL '10 days'),
--   ((SELECT business_id FROM user_business), 'Travel', 1500.00, 'Pending', 'Airline', 'Business trip', CURRENT_DATE - INTERVAL '5 days'),
--   ((SELECT business_id FROM user_business), 'Office', 150.00, 'Approved', 'Staples', 'Office supplies', CURRENT_DATE);

-- =============================================================================
-- 6. DEMO REDEMPTION CODE (Optional)
-- =============================================================================

-- Insert a demo redemption code
-- INSERT INTO public.redemption_codes (code, duration_months, reason, created_by)
-- VALUES
--   ('DEMO2024', 3, 'Demo promotion code', (SELECT id FROM public.profiles WHERE email = 'YOUR_USER_EMAIL'));

-- =============================================================================
-- END OF DEMO DATA
-- =============================================================================
