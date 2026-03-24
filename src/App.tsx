import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import OnboardingPage from "./pages/app/OnboardingPage.tsx";
import DashboardPage from "./pages/app/DashboardPage.tsx";
import MessagesPage from "./pages/app/MessagesPage.tsx";
import ProjectsPage from "./pages/app/ProjectsPage.tsx";
import MyTasksPage from "./pages/app/MyTasksPage.tsx";
import InboxPage from "./pages/app/InboxPage.tsx";
import AutomationPage from "./pages/app/AutomationPage.tsx";
import FormsPage from "./pages/app/FormsPage.tsx";
import CRMPage from "./pages/app/CRMPage.tsx";
import FinancePage from "./pages/app/FinancePage.tsx";
import HRPage from "./pages/app/HRPage.tsx";
import ChatPage from "./pages/app/ChatPage.tsx";
import NotesPage from "./pages/app/NotesPage.tsx";
import SettingsPage from "./pages/app/SettingsPage.tsx";
import NotFoundPage from "./pages/app/NotFoundPage.tsx";

import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* App routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="crm" element={<CRMPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="hr" element={<HRPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Any unknown app sub-route will show the inner 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Privacy & Terms */}
          <Route path="/privacy" element={<div className="p-20 text-center font-black uppercase tracking-tighter text-4xl">Privacy Policy</div>} />
          <Route path="/terms" element={<div className="p-20 text-center font-black uppercase tracking-tighter text-4xl">Terms of Service</div>} />

          {/* Root level 404 - for anything not caught above */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
