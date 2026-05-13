/** Realistic mock data for Version 1.2 preview pages (no lorem-style placeholders). */

export type V12Email = {
  id: string;
  folder: "inbox" | "sent" | "drafts" | "starred" | "spam" | "trash";
  account: "cynda" | "gmail";
  from: { name: string; email: string; avatar?: string };
  to: string[];
  subject: string;
  preview: string;
  body: string;
  html?: boolean;
  time: string;
  unread: boolean;
  starred: boolean;
  hasAttachment: boolean;
};

export const V12_MOCK_EMAILS: V12Email[] = [
  {
    id: "e1",
    folder: "inbox",
    account: "cynda",
    from: { name: "Morgan Ellis", email: "morgan.ellis@northwind.io" },
    to: ["you@cynda.xyz"],
    subject: "Q2 handoff — design specs locked",
    preview: "Attached are the final Figma exports and the accessibility checklist we discussed.",
    body:
      "Hi,\n\nAttached are the final Figma exports and the accessibility checklist we discussed on Tuesday. The engineering team can start implementation Monday.\n\nWe should schedule a 20-minute sync if anything is unclear.\n\n— Morgan",
    time: "2:14 PM",
    unread: true,
    starred: true,
    hasAttachment: true,
  },
  {
    id: "e2",
    folder: "inbox",
    account: "cynda",
    from: { name: "Cynda Billing", email: "billing@cynda.xyz" },
    to: ["you@cynda.xyz"],
    subject: "Receipt — Workspace Pro (March)",
    preview: "Your payment was processed successfully. Thank you for using Cynda.",
    body:
      "Your payment was processed successfully for Workspace Pro — March cycle.\n\nAmount: $49.00 USD\nInvoice: INV-2026-03-8841\n\nThank you for using Cynda.",
    time: "Yesterday",
    unread: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: "e3",
    folder: "inbox",
    account: "cynda",
    from: { name: "Priya Shah", email: "priya@auroramedia.co" },
    to: ["you@cynda.xyz"],
    subject: "Re: Campaign timeline",
    preview: "We can move the launch by one week if finance approves the revised scope.",
    body:
      "Following up on our thread — we can move the launch by one week if finance approves the revised scope. I’ve updated the milestones in the shared doc.\n\nLet me know by Friday COB.\n\nPriya",
    time: "Mon",
    unread: true,
    starred: false,
    hasAttachment: false,
  },
];

export type V12LeaderPerson = {
  id: string;
  rank: number;
  name: string;
  title: string;
  company: string;
  country: string;
  flag: string;
  score: number;
  metric: string;
  metricValue: string;
  trend: "up" | "down" | "same";
  badges: string[];
};

export const V12_MOCK_LEADERBOARD: V12LeaderPerson[] = [
  { id: "p1", rank: 1, name: "Jordan Blake", title: "Head of Revenue", company: "Vertex Labs", country: "United Kingdom", flag: "🇬🇧", score: 982, metric: "Deals closed", metricValue: "14", trend: "up", badges: ["Top Performer", "Deal Closer"] },
  { id: "p2", rank: 2, name: "Samira Okonkwo", title: "Operations Lead", company: "Harbor & Co.", country: "Nigeria", flag: "🇳🇬", score: 964, metric: "Tasks on time", metricValue: "186", trend: "same", badges: ["Consistent", "Perfect Week"] },
  { id: "p3", rank: 3, name: "Diego Alvarez", title: "Project Director", company: "Crestline PM", country: "Mexico", flag: "🇲🇽", score: 951, metric: "Projects delivered", metricValue: "9", trend: "up", badges: ["Project Champion"] },
  { id: "p4", rank: 4, name: "Emily Chen", title: "Finance Partner", company: "Northwind", country: "Canada", flag: "🇨🇦", score: 903, metric: "Revenue", metricValue: "$842k", trend: "up", badges: [] },
  { id: "p5", rank: 5, name: "Alex Rivera", title: "CRM Admin", company: "Brightfield", country: "United States", flag: "🇺🇸", score: 891, metric: "Response time", metricValue: "1.2h avg", trend: "down", badges: ["Rising Star"] },
];

export const V12_HERO_ROTATION = [
  { name: "Jordan Blake", company: "Vertex Labs", country: "United Kingdom", summary: "14 deals closed · 982 overall score" },
  { name: "Samira Okonkwo", company: "Harbor & Co.", country: "Nigeria", summary: "186 tasks on time · 964 overall score" },
  { name: "Diego Alvarez", company: "Crestline PM", country: "Mexico", summary: "9 projects delivered · 951 overall score" },
];

export type V12Listing = {
  id: string;
  seller: string;
  score: number;
  title: string;
  category: string;
  description: string;
  price: number;
  delivery: string;
  rating: number;
  reviews: number;
  verifiedMonths: number;
  topRated: boolean;
};

export const V12_MOCK_LISTINGS: V12Listing[] = [
  { id: "l1", seller: "Rowan Tate", score: 912, title: "Executive pitch deck — narrative & design", category: "Design", description: "Board-ready storyline, typography, and chart styling aligned to your brand system.", price: 680, delivery: "5 days", rating: 4.9, reviews: 127, verifiedMonths: 14, topRated: true },
  { id: "l2", seller: "Nadia Rahman", score: 889, title: "CRM hygiene & pipeline reporting pack", category: "Sales", description: "Stage definitions, SLA alerts, and weekly leadership snapshot templates for Cynda CRM.", price: 420, delivery: "3 days", rating: 4.8, reviews: 84, verifiedMonths: 8, topRated: false },
  { id: "l3", seller: "Chris Okafor", score: 901, title: "Lightweight automation — invoice nudges", category: "Finance", description: "Three automations: overdue reminders, approval escalations, and month-end checklist.", price: 550, delivery: "7 days", rating: 5.0, reviews: 56, verifiedMonths: 22, topRated: true },
  { id: "l4", seller: "Helena Costa", score: 876, title: "Employer brand kit + job post templates", category: "HR & Recruiting", description: "Tone guide, social tiles, and structured Cynda hiring campaign copy.", price: 390, delivery: "4 days", rating: 4.7, reviews: 41, verifiedMonths: 6, topRated: false },
  { id: "l5", seller: "Marcus Webb", score: 928, title: "Product analytics dashboard spec", category: "Data & Analytics", description: "Metric dictionary, event schema notes, and Looker-style layout for leadership reviews.", price: 720, delivery: "6 days", rating: 4.9, reviews: 93, verifiedMonths: 18, topRated: true },
  { id: "l6", seller: "Yuki Tanaka", score: 865, title: "Customer success QBR deck generator", category: "Customer Service", description: "Slide master, health-score storytelling, and renewal talking points.", price: 510, delivery: "5 days", rating: 4.8, reviews: 62, verifiedMonths: 11, topRated: false },
];

export const V12_MARKETPLACE_CATEGORIES = [
  "Design",
  "Development",
  "Writing & Copy",
  "Marketing",
  "Finance",
  "HR & Recruiting",
  "Video & Animation",
  "Data & Analytics",
  "Legal (advisory)",
  "Operations",
  "Customer Service",
  "Sales",
  "Other",
];
