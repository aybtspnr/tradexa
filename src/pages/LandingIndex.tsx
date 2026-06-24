"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "./Index/components/HeroSection";
import { StatsSection } from "./Index/components/StatsSection";
import { PlatformVisionSection } from "./Index/components/PlatformVisionSection";
import { ServicesSection } from "./Index/components/ServicesSection";
import { JourneysSection } from "./Index/components/JourneysSection";
import { MarketsSection } from "./Index/components/MarketsSection";
import { Header } from "./Index/components/Header";
import { Footer } from "./Index/components/Footer";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { FAQSection } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { CustomerSegmentsSection } from "@/components/sections/CustomerSegments";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header scrolled={scrolled} onScrollToSection={scrollToSection} />
      
      <main>
        <HeroSection />
        <StatsSection />
        <PlatformVisionSection />
        <ServicesSection />
        <section id="segmentos">
          <CustomerSegmentsSection />
        </section>
        <JourneysSection />
        <HowItWorksSection />
        <FAQSection />
        <MarketsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;