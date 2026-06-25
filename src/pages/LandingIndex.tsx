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
import { ParticleCanvasThemed } from "@/components/3d";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { FAQSection } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { CustomerSegmentsSection } from "@/components/sections/CustomerSegments";
import { useSeo } from "@/hooks/use-seo";

const Index = () => {
  useSeo({
    title: "TRADEXA — Plataforma de Inteligência Comercial",
    description: "Plataforma completa de comércio exterior com classificação NCM por IA, tarifário global de 31 países, rastreamento de cargas ao vivo e diretório de importadores.",
    keywords: "comércio exterior, classificação NCM, importação, exportação, inteligência comercial, tarifas, frete marítimo, TRADEXA",
  });
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