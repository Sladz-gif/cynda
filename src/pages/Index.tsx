import { Navigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AISection from "@/components/landing/AISection";
import CoFounderSection from "@/components/landing/CoFounderSection";
import SecuritySection from "@/components/landing/SecuritySection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useIndustryStore } from "@/lib/industry-store";

const Index = () => {
  const { isAuthenticated, isOnboarded } = useIndustryStore();

  if (isAuthenticated && isOnboarded) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (isAuthenticated && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <UseCasesSection />
      <FeaturesSection />
      <AISection />
      <CoFounderSection />
      <SecuritySection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
