# Cynda — Unified Work OS for Modern Businesses

Cynda is an all-in-one workspace platform that replaces your scattered tools. It combines CRM, finance, HR, project management, and AI-powered assistance into a single, intuitive interface.

## Features

### 🏠 Dashboard
Get a bird's-eye view of your business: recent deals, upcoming tasks, sales performance, and team activity—all on one clean dashboard.

### 🤝 CRM
- Manage your entire contact database
- Track deals through your sales pipeline
- View complete interaction history with every customer
- Import existing contacts quickly
- Run multi-channel marketing campaigns

### 💰 Finance
- Send professional invoices to clients
- Track business expenses and receipts
- Manage payroll for your team
- Monitor inventory levels
- Generate financial reports and analytics

### 👥 HR
- Maintain a complete team directory
- Streamline new staff onboarding
- Track time off, attendance, and performance
- Manage hiring pipelines

### 📋 Projects & Tasks
- Plan and organize projects
- Assign tasks to team members
- Use kanban boards, list views, or calendars
- Track project timelines and milestones
- Manage resources and workloads

### 📝 Notes & Files
- Collaborative note-taking and document management
- Secure, organized file storage
- Quick search to find what you need

### 🤖 Cynda AI
AI-powered assistance to help with drafting, brainstorming, and automating repetitive tasks.

### 💳 Billing
Seamless payment integration via Paystack, supporting Visa, Mastercard, Verve, and mobile money (Ghana).

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (with persistence)
- **Routing**: React Router
- **Backend/Authentication**: Supabase (Auth + Database + Edge Functions)
- **Payments**: Paystack (via Supabase Edge Functions)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project
- A Paystack account (for payment features)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cynda.git
   cd cynda
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project using `.env.example` as a reference:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   ```

4. Set up your Supabase project:
   - Create a new Supabase project
   - Go to the SQL Editor and run all migrations in the `supabase/` folder (in order)
   - Go to Authentication → Providers → Email and uncheck "Confirm email" for easier testing
   - Deploy the Edge Functions from the `supabase/functions` folder:
     ```bash
     # Install Supabase CLI first if you haven't
     supabase functions deploy paystack-initialize
     supabase functions deploy paystack-verify
     supabase functions deploy paystack-webhook
     ```
   - Set your Paystack secret key as a Supabase Function Secret:
     ```bash
     supabase secrets set PAYSTACK_SECRET_KEY=your-paystack-secret-key
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit the app at http://localhost:5173 (or the port shown in your terminal)!

## Project Structure

```
cynda/
├── src/
│   ├── components/
│   │   ├── app/              # App-specific components
│   │   └── ui/               # shadcn/ui components
│   ├── pages/
│   │   ├── auth/             # Sign in, sign up, password reset
│   │   ├── app/              # Main app pages (dashboard, CRM, finance, etc.)
│   │   └── billing/          # Payment-related pages
│   ├── lib/
│   │   ├── industry-store.ts # Zustand store
│   │   ├── auth-slice.ts     # Auth state slice
│   │   ├── supabase.ts       # Supabase client
│   │   └── ...               # Other utilities
│   └── main.tsx              # App entry point
├── supabase/
│   ├── migrations/           # Database migrations (SQL)
│   └── functions/            # Supabase Edge Functions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

[Your chosen license]
