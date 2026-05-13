# Cynda Business OS - Comprehensive Documentation

Cynda is a high-fidelity, dynamic Business Operating System designed to scale with your organization. It provides a "Single Source of Truth" architecture where the interface and functionality adapt in real-time based on your business needs.

**Implementation note:** The app shell and routes in this repo follow this document. **Import History** is available at `/app/crm/import-history`. **Auth screens** (mock/local): `/sign-in`, `/sign-up`, `/forgot-password`. Documentation and tasks for this codebase are maintained using **Cursor** (not Trae).

---

## 1. Core Departments and Tools

Cynda is organized into five primary departments, each containing a suite of specialized tools.

### **A. Clients (CRM)**
Focuses on the entire customer lifecycle, from lead generation to deal closure.
- **CRM Dashboard**: Overview of lead growth, active campaigns, and engagement rates.
- **Deals (Pipeline)**: A Kanban-style board for managing sales stages (Lead, Qualified, Proposal, Negotiation, Closed Won).
- **Marketing**: Campaign management for launching and tracking multi-channel marketing efforts.
- **Sales Automation**: Workflow builder for automating sales pipelines and lead follow-ups.
- **Reports**: Detailed analytics on conversion rates and revenue growth.
- **Import History**: Logs for all data migrations and AI-mapped imports.

### **B. Finance**
A comprehensive suite for managing company health and financial operations.
- **Finance Dashboard**: Real-time overview of revenue, net profit, and outstanding balances.
- **Invoicing**: Create, track, and manage professional invoices with status tracking (Paid, Pending, Overdue).
- **Expenses**: Log business spending with approval workflows and category tagging.
- **Payroll**: Manage employee salaries, taxes, and distributions.
- **Inventory**: Track stock levels, company assets, and equipment with serial number logging.
- **Payments**: Integration with payment gateways like Stripe and bank synchronization.
- **Multi-Currency**: Support for global operations with active exchange rate tracking.
- **Reports**: Generation of P&L statements, Balance Sheets, and Cash Flow statements.

### **C. Projects**
Tools for coordinating work and maintaining productivity.
- **Task Management**: List and priority-based task tracking across teams.
- **Kanban View**: Visual project management for moving tasks through workflows.
- **Calendar View**: Deadline and milestone visualization on a unified timeline.
- **Timeline / Gantt**: Advanced planning for project dependencies and roadmaps.
- **Resource Management**: Balancing team workload and efficient task assignment.

### **D. People (HR)**
A powerful administrative hub for workforce management.
- **HR Dashboard**: Monitoring headcount, retention, and department splits.
- **Directory**: Central hub for all staff profiles, contact info, and roles.
- **Staff Onboarding**: A high-fidelity tool for HR to add new members via AI document parsing or manual entry.
- **Hiring**: Management of job postings, candidates, and interview pipelines.
- **Time Off**: Tracking leave requests, vacations, and sick days with a specialized calendar.
- **Time Tracking**: Live attendance monitoring with clock-in/out functionality.
- **Surveillance**: Activity logs for monitoring actions across the workspace (e.g., deal updates, payroll approval).
- **Org Chart & Teams**: Visualization of company structure and team hierarchies.

### **E. Tools (General)**
General utility tools for daily operations.
- **Messaging (Chat)**: Real-time communication with internal channels and **External Contacts** (invite via email).
- **Email (Inbox)**: Full-featured email client with support for **External Accounts** (Gmail, Outlook).
- **Notes**: Collaborative wikis and personal knowledge base documents.
- **Automations**: Workflow builder to connect tools and automate repetitive tasks.
- **Forms**: Custom form builder for collecting structured data from users or clients.
- **Files**: Secure repository for all documents and company assets.

---

## 2. Key Features & AI Integration (Cyndi)

### **Cyndi AI Assistant**
Cyndi is the core intelligence of the platform, integrated across all modules:
- **AI Document Parsing**: In Staff Onboarding, Cyndi extracts employee details from PDFs, spreadsheets, or contracts.
- **Data Migration**: In CRM, Cyndi automatically interprets column headers from external files (Salesforce, HubSpot) and maps them to Cynda's data structure.
- **AI Insights**: Provides automated financial analysis and sales velocity projections.
- **Branding**: Cyndi is the unified name for all AI-driven features, replacing generic assistant mentions.

### **Dynamic Field Engine**
HR and Admins have "all the power" to customize staff records:
- **Custom Structure**: Add new input boxes and data titles (e.g., "Employee ID", "Joining Date").
- **Field Types**: Supports Text, Number, Date, and Select dropdowns.
- **Real-time Mapping**: These custom fields automatically appear in the manual entry forms for staff.

### **External Communication**
- **External Messaging**: Start chats with anyone outside the company by inviting their email address.
- **Multi-Account Email**: Connect multiple external email addresses (Gmail, Outlook) to send and receive professional emails from a single interface.

---

## 3. Interaction & Buttons

### **Global Actions**
- **Settings**: Access workspace configuration, profile, and theme.
- **Notifications**: Real-time alerts for system events and messages.
- **Search**: Global search for contacts, tasks, and documents.

### **Specific Tool Buttons**
- **HR**: "Staff Onboarding", "Quick Add", "Request Leave", "Clock In/Out".
- **CRM**: "Data Migration", "New Deal", "Create Campaign", "Build Report".
- **Finance**: "New Invoice", "Log Expense", "Run Payroll", "Add Asset".
- **Chat/Email**: "New Chat", "New Email", "Invite (External)", "From Selection".
- **Dashboard**: "Create Task", "Settings", department-specific widget links.

---

## 4. Settings & Workspace Management

The Settings module is the control center for the entire OS:
- **Your Profile**: Manage personal details, job role, and avatars.
- **Workspace**: Admins can activate/deactivate specific modules and tools for the entire organization.
- **Team**: Manage internal teams and leader assignments.
- **External Accounts**: Link external Gmail or Outlook accounts for email integration.
- **Theme**: Advanced theme engine with light/dark/system modes and accent color personalization.
- **Density Control**: Choose between Compact, Comfortable, or Spacious layout scaling.
- **Billing**: Manage subscriptions (Solo, Team, Organisation) and billing cycles.

---

## 5. Organizational Structure

### **User Types**
- **Solo**: Freelancers and independent professionals.
- **Small Business**: Small teams with shared tools and admin controls.
- **Large Business / Organisation**: Multi-department structure with surveillance and advanced oversight.
- **Enterprise**: Custom solutions for large organizations.

### **Roles**
- **Super Admin / Director**: Full control over settings, migration, and HR structure.
- **Manager**: Oversight of specific departments and team approvals.
- **Employee**: Access to assigned tools and personal tasks.
