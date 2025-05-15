import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ClientLogos } from "@/components/landing/client-logos";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel";
import { DemoSection } from "@/components/landing/demo-section";
import { ROICalculator } from "@/components/landing/roi-calculator";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { TrialSignup } from "@/components/landing/trial-signup";
import { Footer } from "@/components/landing/footer";
import { ChatWidget } from "@/components/ui/chat-widget";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

export default function Home() {
  // Handle anchor links with smooth scrolling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Handle initial load with hash
    handleHashChange();

    // Add listener for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ClientLogos />
        <FeaturesGrid />
        <HowItWorks />
        <TestimonialCarousel />
        <DemoSection />
        <div id="roi-calculator" className="bg-gray-50 py-12">
          <ROICalculator />
        </div>
        <PricingSection />
        <TrialSignup />
        <FaqSection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
