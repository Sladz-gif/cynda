export const VOLTA_FOODS_COMPANY = {
  name: "Volta Foods Ltd",
  location: "Accra, Ghana",
  industry: "Food Distribution"
};

export const KPIS = {
  revenue: { value: 284500, change: 12.4, label: "Total Revenue" },
  deals: { value: 23, change: 3, label: "Active Deals" },
  tasks: { value: 47, change: 0, label: "Open Tasks" },
  team: { value: 14, change: 0, label: "Team Members" }
};

export const SALES_CHART_DATA = [
  { month: "Jan", revenue: 120000 },
  { month: "Feb", revenue: 145000 },
  { month: "Mar", revenue: 162000 },
  { month: "Apr", revenue: 185000 },
  { month: "May", revenue: 210000 },
  { month: "Jun", revenue: 284500 }
];

export const RECENT_DEALS = [
  { id: "d1", company: "Shoprite Ghana", value: 45000, status: "Negotiation" },
  { id: "d2", company: "Melcom Group", value: 28750, status: "Proposal Sent" },
  { id: "d3", company: "Palace Hypermarket", value: 67200, status: "Won" },
  { id: "d4", company: "Koala Shopping Centre", value: 19400, status: "Discovery" },
  { id: "d5", company: "City Mart", value: 33600, status: "Won" }
];

export const UPCOMING_TASKS = [
  { id: "t1", title: "Follow up: Shoprite proposal", assignee: "Ama K.", due: "Tomorrow" },
  { id: "t2", title: "Prepare Q3 inventory report", assignee: "Kweku A.", due: "In 2 days" },
  { id: "t3", title: "Onboard new sales rep", assignee: "Adjoa M.", due: "Friday" }
];

export const TEAM_ACTIVITY_FEED = [
  { id: "a1", message: "Ama closed a deal with Palace Hypermarket" },
  { id: "a2", message: "Kweku added 3 new contacts from the trade fair" },
  { id: "a3", message: "Adjoa submitted the June payroll" },
  { id: "a4", message: "New task assigned: Restock warehouse B" }
];

export const CRM_PIPELINE_COLUMNS = [
  { id: "lead", title: "Lead" },
  { id: "discovery", title: "Discovery" },
  { id: "proposal", title: "Proposal" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" }
];

export const CRM_DEALS = [
  { id: "cd1", columnId: "lead", company: "Franko Trading", value: 22000, assignee: "Ama K.", daysInStage: 2 },
  { id: "cd2", columnId: "lead", company: "Foodie Express", value: 18000, assignee: "Kofi B.", daysInStage: 1 },
  { id: "cd3", columnId: "discovery", company: "Koala Shopping Centre", value: 19400, assignee: "Ama K.", daysInStage: 4 },
  { id: "cd4", columnId: "discovery", company: "Fresh Basket GH", value: 25000, assignee: "Adjoa M.", daysInStage: 2 },
  { id: "cd5", columnId: "proposal", company: "Melcom Group", value: 28750, assignee: "Ama K.", daysInStage: 3 },
  { id: "cd6", columnId: "proposal", company: "MaxMart", value: 31000, assignee: "Kofi B.", daysInStage: 5 },
  { id: "cd7", columnId: "proposal", company: "Kumasi Central Store", value: 42000, assignee: "Kweku A.", daysInStage: 1 },
  { id: "cd8", columnId: "negotiation", company: "Shoprite Ghana", value: 45000, assignee: "Ama K.", daysInStage: 7 },
  { id: "cd9", columnId: "negotiation", company: "Game Stores", value: 38000, assignee: "Kofi B.", daysInStage: 2 },
  { id: "cd10", columnId: "won", company: "Palace Hypermarket", value: 67200, assignee: "Ama K.", daysInStage: 0 },
  { id: "cd11", columnId: "won", company: "City Mart", value: 33600, assignee: "Kofi B.", daysInStage: 0 },
  { id: "cd12", columnId: "lost", company: "Accra Mall Supermarket", value: 29000, assignee: "Kweku A.", daysInStage: 10 }
];

export const CRM_CONTACTS = [
  { id: "c1", name: "Kofi Mensah", company: "Shoprite Ghana", phone: "+233 24 123 4567", email: "kofi@shopritegh.com", lastContact: "2025-06-20" },
  { id: "c2", name: "Ama Addo", company: "Melcom Group", phone: "+233 27 987 6543", email: "ama@melcomgh.com", lastContact: "2025-06-18" },
  { id: "c3", name: "Kwame Boateng", company: "Palace Hypermarket", phone: "+233 20 456 7890", email: "kwame@palacegh.com", lastContact: "2025-06-25" },
  { id: "c4", name: "Adwoa Arthur", company: "Koala Shopping Centre", phone: "+233 54 321 0987", email: "adwoa@koalagh.com", lastContact: "2025-06-15" },
  { id: "c5", name: "Yaw Osei", company: "City Mart", phone: "+233 26 654 3210", email: "yaw@citymartgh.com", lastContact: "2025-06-22" }
];

export const FINANCE_INVOICES = [
  { id: "inv1", number: "INV-001", customer: "Shoprite Ghana", amount: 45000, status: "Paid" },
  { id: "inv2", number: "INV-002", customer: "Melcom Group", amount: 28750, status: "Pending" },
  { id: "inv3", number: "INV-003", customer: "Palace Hypermarket", amount: 67200, status: "Paid" },
  { id: "inv4", number: "INV-004", customer: "Koala Shopping Centre", amount: 19400, status: "Overdue" },
  { id: "inv5", number: "INV-005", customer: "City Mart", amount: 33600, status: "Draft" },
  { id: "inv6", number: "INV-006", customer: "MaxMart", amount: 22100, status: "Pending" }
];

export const FINANCE_EXPENSES = [
  { id: "e1", category: "Logistics", amount: 5200, date: "2025-06-20", receipt: true },
  { id: "e2", category: "Utilities", amount: 1800, date: "2025-06-19", receipt: true },
  { id: "e3", category: "Salaries", amount: 42000, date: "2025-06-15", receipt: true },
  { id: "e4", category: "Marketing", amount: 3500, date: "2025-06-10", receipt: true },
  { id: "e5", category: "Supplies", amount: 8400, date: "2025-06-08", receipt: true }
];

export const FINANCE_EXPENSE_CATEGORIES = [
  { name: "Logistics", value: 5200 },
  { name: "Utilities", value: 1800 },
  { name: "Salaries", value: 42000 },
  { name: "Marketing", value: 3500 },
  { name: "Supplies", value: 8400 }
];

export const HR_TEAM_DIRECTORY = [
  { id: "h1", name: "Ama K.", role: "Sales Manager", department: "Sales", email: "ama@voltafoods.com", phone: "+233 24 111 2222" },
  { id: "h2", name: "Kofi B.", role: "Sales Rep", department: "Sales", email: "kofi@voltafoods.com", phone: "+233 27 333 4444" },
  { id: "h3", name: "Esi D.", role: "Sales Rep", department: "Sales", email: "esi@voltafoods.com", phone: "+233 20 555 6666" },
  { id: "h4", name: "Kojo F.", role: "Sales Rep", department: "Sales", email: "kojo@voltafoods.com", phone: "+233 54 777 8888" },
  { id: "h5", name: "Kweku A.", role: "Operations Manager", department: "Operations", email: "kweku@voltafoods.com", phone: "+233 26 999 0000" },
  { id: "h6", name: "Adwoa M.", role: "Warehouse Supervisor", department: "Operations", email: "adwoa@voltafoods.com", phone: "+233 24 123 4567" },
  { id: "h7", name: "Yaw N.", role: "Driver", department: "Operations", email: "yaw@voltafoods.com", phone: "+233 27 765 4321" },
  { id: "h8", name: "Adjoa M.", role: "Finance Manager", department: "Finance", email: "adjoa@voltafoods.com", phone: "+233 20 890 1234" },
  { id: "h9", name: "Nana A.", role: "Accountant", department: "Finance", email: "nana@voltafoods.com", phone: "+233 54 321 0987" },
  { id: "h10", name: "Afua S.", role: "Marketing Manager", department: "Marketing", email: "afua@voltafoods.com", phone: "+233 26 654 3210" },
  { id: "h11", name: "Kojo T.", role: "Marketing Assistant", department: "Marketing", email: "kojot@voltafoods.com", phone: "+233 24 432 1098" },
  { id: "h12", name: "Ama P.", role: "Admin Officer", department: "Admin", email: "amap@voltafoods.com", phone: "+233 27 567 8901" },
  { id: "h13", name: "Kwesi R.", role: "HR Assistant", department: "Admin", email: "kwesi@voltafoods.com", phone: "+233 20 210 9876" },
  { id: "h14", name: "Nana Yaw", role: "CEO", department: "Admin", email: "ceo@voltafoods.com", phone: "+233 54 109 8765" }
];

export const PROJECTS_DATA = [
  { id: "p1", title: "Q3 Product Launch", progress: 68, tasks: 12, due: "Aug 15", status: "In Progress" },
  { id: "p2", title: "Warehouse Expansion", progress: 34, tasks: 8, due: "Sep 30", status: "In Progress" },
  { id: "p3", title: "CRM Migration", progress: 100, tasks: 15, due: "Jun 1", status: "Completed" },
  { id: "p4", title: "Back to School Campaign", progress: 20, tasks: 6, due: "Jul 28", status: "In Progress" }
];

export const PROJECT_TASKS = [
  { id: "pt1", columnId: "todo", title: "Design new packaging", projectId: "p1" },
  { id: "pt2", columnId: "inprogress", title: "Finalize supplier contracts", projectId: "p1" },
  { id: "pt3", columnId: "review", title: "Review marketing materials", projectId: "p1" },
  { id: "pt4", columnId: "done", title: "Define product SKUs", projectId: "p1" },
  { id: "pt5", columnId: "todo", title: "Get permits for warehouse", projectId: "p2" },
  { id: "pt6", columnId: "inprogress", title: "Hire construction team", projectId: "p2" }
];

export const NOTES_DATA = [
  { id: "n1", title: "Q3 Sales Strategy", content: "Focus on schools and universities for the back to school season. Target bulk orders for snacks and beverages. Offer discounts for orders over GHS 5000." },
  { id: "n2", title: "Meeting Notes: Shoprite Call", content: "Discussed pricing for Q3. They want a 5% discount. We can offer 3% if they increase order volume by 15%." },
  { id: "n3", title: "Product Ideas - Next Quarter", content: "1. Organic snacks line\n2. Local Ghanaian ingredients\n3. Kids-friendly packaging\n4. Subscription boxes" },
  { id: "n4", title: "Team Offsite Agenda", content: "1. Review Q2 performance\n2. Team building activities\n3. Q3 goals setting\n4. Dinner at local restaurant" },
  { id: "n5", title: "Supplier List", content: "Kumasi Farms: Fresh produce\nAccra Packaging: Boxes and labels\nTema Logistics: Delivery partner" },
  { id: "n6", title: "Board Meeting Prep", content: "Prepare financial statements for Q2. Update on sales pipeline. HR report on new hires." }
];

export const FILES_DATA = [
  { id: "f1", name: "Q2 Financial Report.pdf", type: "pdf", size: "2.4 MB" },
  { id: "f2", name: "Product Catalog.xlsx", type: "xlsx", size: "1.1 MB" },
  { id: "f3", name: "Brand Guidelines.docx", type: "docx", size: "850 KB" },
  { id: "f4", name: "Warehouse Layout.png", type: "image", size: "1.8 MB" }
];

export const AI_CONVERSATION = [
  { id: "ai1", role: "user", text: "Draft a follow-up email to Shoprite Ghana after our last meeting" },
  { id: "ai2", role: "assistant", text: "Subject: Follow Up: Q3 Product Supply Agreement\n\nHi Kofi,\n\nGreat speaking with you yesterday about our Q3 product lineup. As promised, I've attached the revised pricing sheet with the volume discount we discussed.\n\nCould we schedule a 15-minute call later this week to walk through any questions you might have?\n\nBest regards,\nAma K.\nSales Manager\nVolta Foods Ltd" },
  { id: "ai3", role: "user", text: "Summarize this month's sales performance" },
  { id: "ai4", role: "assistant", text: "Here's your June sales summary:\n\n📈 Revenue: GHS 284,500 (up 12.4% from May)\n✅ Deals Closed: 2\n🔄 Active Deals: 23\n🎯 Top Customer: Palace Hypermarket (GHS 67,200)\n\nKey wins:\n- Secured the Palace Hypermarket contract\n- Added 3 new contacts from the trade fair\n\nAreas to focus:\n- Follow up on the Shoprite negotiation\n- Collect overdue payment from Koala Shopping Centre" }
];

export const AI_SUGGESTIONS = [
  "Draft an invoice email",
  "Summarize open deals",
  "Create a task checklist for product launch"
];

export const AI_RESPONSES = [
  "Here's a professional draft for you to review...",
  "Based on your data, here's what I found...",
  "Great question! Let me break that down...",
  "I've put together a checklist for that...",
  "Perfect, here's what you need to know..."
];
