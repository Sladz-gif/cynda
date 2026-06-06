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

export const V12_MOCK_EMAILS: V12Email[] = [];

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

export const V12_MOCK_LEADERBOARD: V12LeaderPerson[] = [];

export const V12_HERO_ROTATION: { name: string; company: string; country: string; summary: string }[] = [];

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

export const V12_MOCK_LISTINGS: V12Listing[] = [];

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
