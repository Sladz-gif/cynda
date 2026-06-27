import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import OnboardingPage from "./pages/app/OnboardingPage";
import DashboardPage from "./pages/app/DashboardPage";
import MessagesPage from "./pages/app/MessagesPage";
import ProjectsPage from "./pages/app/ProjectsPage";
import MyTasksPage from "./pages/app/MyTasksPage";
import InboxPage from "./pages/app/InboxPage";
import AutomationPage from "./pages/app/AutomationPage";
import FormsPage from "./pages/app/FormsPage";
import CRMPage from "./pages/app/CRMPage";
import FinancePage from "./pages/app/FinancePage";
import HRPage from "./pages/app/HRPage";
import ChatComingSoonPage from "./pages/app/ChatComingSoonPage";
import NotesPage from "./pages/app/NotesPage";
import FilesPage from "./pages/app/FilesPage";
import SettingsPage from "./pages/app/SettingsPage";
import ProfilePage from "./pages/app/ProfilePage";
import NotFoundPage from "./pages/app/NotFoundPage";
import StaffOnboardingPage from "./pages/app/StaffOnboardingPage";
import CRMImportHistoryPage from "./pages/app/CRMImportHistoryPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ForcePasswordResetPage from "./pages/auth/ForcePasswordResetPage";
import SuperAdminAuthPage from "./pages/app/SuperAdminAuthPage";
import SuperAdminPage from "./pages/app/SuperAdminPage";
import EmailComingSoonPage from "./pages/app/EmailComingSoonPage";
import PerformanceComingSoonPage from "./pages/app/PerformanceComingSoonPage";
import MarketplaceComingSoonPage from "./pages/app/MarketplaceComingSoonPage";
import SurveillancePage from "./pages/app/SurveillancePage";
import SelectPlanPage from "./pages/billing/SelectPlanPage";
import CheckoutPage from "./pages/billing/CheckoutPage";
import PaymentSuccessPage from "./pages/billing/PaymentSuccessPage";
import PaymentFailedPage from "./pages/billing/PaymentFailedPage";
import PaymentCallbackPage from "./pages/billing/PaymentCallbackPage";

import { ThemeProvider } from "./components/app/ThemeProvider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/login" element={<Navigate to="/signin" replace />} />
              <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/force-password-reset" element={<ForcePasswordResetPage />} />
              <Route path="/billing/select-plan" element={<SelectPlanPage />} />
              <Route path="/billing/checkout" element={<CheckoutPage />} />
              <Route path="/billing/success" element={<PaymentSuccessPage />} />
              <Route path="/billing/failed" element={<PaymentFailedPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              <Route path="/super-admin/auth" element={<SuperAdminAuthPage />} />
              <Route path="/super-admin" element={<SuperAdminPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="automation" element={<AutomationPage />} />
                <Route path="forms" element={<FormsPage />} />
                <Route path="crm" element={<CRMPage />} />
                <Route path="crm/import-history" element={<CRMImportHistoryPage />} />
                <Route path="marketing" element={<CRMPage />} />
                <Route path="crm-automation" element={<CRMPage />} />
                <Route path="reports" element={<CRMPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="finance-dashboard" element={<FinancePage />} />
                <Route path="invoicing" element={<FinancePage />} />
                <Route path="expenses" element={<FinancePage />} />
                <Route path="payroll" element={<FinancePage />} />
                <Route path="inventory" element={<FinancePage />} />
                <Route path="hr" element={<HRPage />} />
                <Route path="hr/onboarding" element={<StaffOnboardingPage />} />
                <Route path="directory" element={<HRPage />} />
                <Route path="departments" element={<HRPage />} />
                <Route path="hiring" element={<HRPage />} />
                <Route path="onboarding" element={<HRPage />} />
                <Route path="time-off" element={<HRPage />} />
                <Route path="hr-time-tracking" element={<HRPage />} />
                <Route path="hr-payroll" element={<HRPage />} />
                <Route path="hr-analytics" element={<HRPage />} />
                <Route path="teams" element={<HRPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="kanban" element={<ProjectsPage />} />
                <Route path="list-view" element={<ProjectsPage />} />
                <Route path="timeline" element={<ProjectsPage />} />
                <Route path="calendar" element={<ProjectsPage />} />
                <Route path="resource-management" element={<ProjectsPage />} />
                <Route path="chat" element={<ChatComingSoonPage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="files" element={<FilesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="email" element={<EmailComingSoonPage />} />
                <Route path="performance" element={<PerformanceComingSoonPage />} />
                <Route path="marketplace" element={<MarketplaceComingSoonPage />} />
                <Route path="surveillance" element={<SurveillancePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="/privacy" element={<div className="p-20 text-center font-black uppercase tracking-tighter text-4xl">Privacy Policy</div>} />
              <Route path="/terms" element={<div className="p-20 text-center font-black uppercase tracking-tighter text-4xl">Terms of Service</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
