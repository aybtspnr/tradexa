"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, BarChart3, Globe, Shield, Zap, TrendingUp,
  Package, Map, ChevronRight, Sparkles, Check,
  ChevronDown, Menu, X, Database, Navigation,
  BellRing, Search, RefreshCw, Brain, Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo3D } from "@/components/Logo3D";
import { ParticleCanvasThemed, TiltWrapper } from "@/components/3d";
import { TextScramble, MagneticButton, ScrollReveal, SpotlightCard } from "@/components/premium";
import { StatsBarSection } from "@/components/home/StatsBarSection";
import { WhatIsTradexaSection } from "@/components/home/WhatIsTradexaSection";
import { PlatformModulesSection } from "@/components/home/PlatformModulesSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { Helmet } from "react-helmet-async";
import { useSeo } from "@/hooks/use-seo";
import { Footer } from "@/pages/Index/components/Footer";
import "./HomePage.css";

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */
interface ModuleData {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  route: string;
  color: string;
}


/* ═══════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(value);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = 30;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ═══════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════ */
function SectionHeader({ badge, title, subtitle, dark = false }: { badge: string; title: ReactNode; subtitle?: string; dark?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="text-center mb-16 md:mb-20"
    >
      <Badge className={`mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 ${
        dark ? "bg-white/10 text-white/70" : "bg-[#D80E16]/8 text-[#D80E16]"
      }`}>
        {badge}
      </Badge>
      <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5 ${dark ? "text-white" : "text-[#0F111A]"}`}>
        {title}
      </h2>
      {subtitle && <p className={`text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${dark ? "text-white/60" : "text-[#5E6278]"}`}>{subtitle}</p>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   HEADER — Glassmorphism, transparente
   ═══════════════════════════════════════ */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navBase = "px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative flex items-center gap-1.5";
  const navActive = "text-[#D80E16] bg-[#D80E16]/[0.06]";
  const navInactive = "text-[#5E6278] hover:text-[#0F111A] hover:bg-black/[0.04]";

  const serviceLinks = [
    { label: "Classificador IA NCM", href: "/landing/ncm-classifier", icon: <Search className="w-4 h-4" />, color: "#D80E16", desc: "Classificação automática de produtos" },
    { label: "Track & Trace", href: "/landing/track-trace", icon: <Navigation className="w-4 h-4" />, color: "#D80E16", desc: "Navios e aviões ao vivo", badge: "Novo" },
    { label: "Tarifário Global", href: "/landing/tariff-calculator", icon: <Globe className="w-4 h-4" />, color: "#f59e0b", desc: "Alíquotas de importação em 31 países" },
    { label: "Trade Intelligence", href: "/landing/import-dashboard", icon: <BarChart3 className="w-4 h-4" />, color: "#10b981", desc: "Dados de importação e exportação" },
    { label: "Smart Rank", href: "/landing/export-opportunities", icon: <TrendingUp className="w-4 h-4" />, color: "#8b5cf6", desc: "Ranking de países por oportunidade" },
    { label: "Mapa de Importadores", href: "/landing/import-map", icon: <Map className="w-4 h-4" />, color: "#06b6d4", desc: "Geolocalização de operações" },
    { label: "Diretório Importadores", href: "/landing/importadores", icon: <Database className="w-4 h-4" />, color: "#ef4444", desc: "Milhões de empresas por HS" },
    { label: "Supply Chain Map", href: "/landing/supply-chain", icon: <Globe className="w-4 h-4" />, color: "#D80E16", desc: "Mapa logístico global ao vivo" },
    { label: "Mapa de Frete Marítimo", href: "/landing/maritime-freight-map", icon: <Map className="w-4 h-4" />, color: "#0ea5e9", desc: "Cotações de frete internacional em rotas globais", badge: "Beta" },
  ];

  return (
    <>
      <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? "bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_4px_30px_-15px_rgba(15,17,26,0.1)]" : "bg-transparent"
      }`}
    >
      {scrolled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute top-0 left-0 right-0 h-[1.5px] origin-left"
          style={{ background: "linear-gradient(90deg, transparent, #D80E16, #FF5555, #D80E16, transparent)" }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotateY: 15, rotateX: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ perspective: 800, transformStyle: "preserve-3d" }}
          >
            <Logo3D className="h-8 md:h-9" />
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <Link to="/" className={`${navBase} ${navActive}`}>
            <Sparkles className="w-4 h-4" />Início
          </Link>

          <div ref={servicesRef} className="relative">
            <button onClick={() => setServicesOpen(!servicesOpen)} className={`${navBase} ${navInactive}`}>
              <Package className="w-4 h-4" />Plataforma
              <motion.span animate={{ rotate: servicesOpen ? 180 : 0 }}><ChevronDown className="w-3.5 h-3.5" /></motion.span>
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[360px] bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.06] shadow-2xl overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-black/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Plataforma</p>
                  </div>
                  <div className="p-2">
                    {serviceLinks.map((s, i) => (
                      <motion.div key={s.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={s.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/[0.03] group transition-all">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ background: s.color }}>{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[#0F111A] font-bold text-sm flex items-center gap-1.5">
                              {s.label}
                              {(s as any).badge && <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{(s as any).badge}</span>}
                            </span>
                            <span className="text-[10px] text-[#5E6278] block">{s.desc}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#5E6278]/40 group-hover:text-[#D80E16] transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/servicos" className={`${navBase} ${navInactive}`}><Briefcase className="w-4 h-4" />Serviços</Link>
          <Link to="/sobre" className={`${navBase} ${navInactive}`}><Sparkles className="w-4 h-4" />Sobre</Link>
          <Link to="/pricing" className={`${navBase} ${navInactive}`}><Zap className="w-4 h-4" />Planos</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <Button variant="ghost" size="sm" className="rounded-xl text-[#5E6278] hover:text-[#0F111A]" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl shadow-lg shadow-[#D80E16]/20 border-0" asChild>
            <Link to="/register"><Sparkles className="w-3.5 h-3.5" />Começar<ArrowRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="lg:hidden p-2 rounded-xl text-[#0F111A] hover:bg-black/[0.04]">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

    {createPortal(
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-[#0F111A]/40 backdrop-blur-sm z-[9998]" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-dvh w-[320px] max-w-[90vw] border-l border-black/[0.06] shadow-2xl z-[9999] flex flex-col overscroll-contain"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-white">
                <Logo3D className="h-7" />
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl text-[#5E6278] hover:bg-black/[0.04]"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-1 bg-white">
                <MobileLink to="/" label="Início" icon={<Sparkles className="w-4 h-4" />} />
                <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Plataforma</div>
                {serviceLinks.map(s => <MobileLink key={s.href} to={s.href} label={s.label} badge={(s as any).badge} icon={<span className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px]" style={{ background: s.color }}>{s.icon}</span>} />)}
                <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Outros</div>
                <MobileLink to="/servicos" label="Serviços" icon={<Briefcase className="w-4 h-4" />} />
                <MobileLink to="/sobre" label="Sobre" icon={<Sparkles className="w-4 h-4" />} />
                <MobileLink to="/pricing" label="Planos" icon={<Zap className="w-4 h-4" />} />
              </div>
              <div className="p-4 border-t border-black/[0.06] space-y-2 bg-white">
                <Button variant="outline" className="w-full rounded-xl h-11 font-bold" asChild><Link to="/login">Acessar Conta</Link></Button>
                <Button className="w-full gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl h-11 font-bold" asChild>
                  <Link to="/register"><Sparkles className="w-4 h-4" />Começar Grátis</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </motion.header>
    </>
  );
}

function MobileLink({ to, label, icon, badge }: { to: string; label: string; icon: ReactNode; badge?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-[#0F111A] hover:bg-black/[0.03] transition-all">
      {icon}{label}
      {badge && <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 ml-auto">{badge}</span>}
    </Link>
  );
}


/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
function HeroSection() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -80]);

  // Mobile: render ALL above-the-fold content as plain HTML (no framer-motion)
  // Desktop: keep original framer-motion animations — 88 on Lighthouse!
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Shared hero text content (used by both mobile and desktop)
  const heroContent = (
    <>
      {isMobile ? (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Plataforma de Comércio Exterior
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-6"
        >
          <Sparkles className="w-4 h-4" />
          Plataforma de Comércio Exterior
        </motion.div>
      )}

      {isMobile ? (
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.08] mb-6 tracking-tight text-[#0F111A]">
          A Plataforma Mais Completa de{" "}
          <span className="text-[#D80E16]">Comércio Exterior</span>
        </h1>
      ) : (
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.08] mb-6 tracking-tight text-[#0F111A]"
        >
          A Plataforma Mais Completa de{" "}
          <span className="text-[#D80E16]">Comércio Exterior</span>
        </motion.h1>
      )}

      {isMobile ? (
        <p className="text-lg md:text-xl text-[#5E6278] leading-relaxed mb-8 max-w-lg">
          Classifique produtos com IA, analise mercados em 31 países,
          rastreie cargas ao vivo e encontre importadores — sem sair da plataforma.
        </p>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="text-lg md:text-xl text-[#5E6278] leading-relaxed mb-8 max-w-lg"
        >
          Classifique produtos com IA, analise mercados em 31 países,
          rastreie cargas ao vivo e encontre importadores — sem sair da plataforma.
        </motion.p>
      )}

      {isMobile ? (
        <div className="flex flex-wrap gap-4 mb-12">
          <Button size="lg" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] hover:shadow-[0_0_60px_rgba(216,14,22,0.35)] transition-all border-0 btn-glow" asChild>
            <Link to="/register">Criar Conta Grátis <ArrowRight className="w-5 h-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2 border-[#0F111A]/15 text-[#0F111A] hover:bg-[#0F111A]/[0.03] px-8 py-6 text-base font-bold rounded-2xl" asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <Button size="lg" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] hover:shadow-[0_0_60px_rgba(216,14,22,0.35)] transition-all border-0 btn-glow" asChild>
            <Link to="/register">Testar Grátis <ArrowRight className="w-5 h-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2 border-[#0F111A]/15 text-[#0F111A] hover:bg-[#0F111A]/[0.03] px-8 py-6 text-base font-bold rounded-2xl" asChild>
            <Link to="/login">Acessar Plataforma</Link>
          </Button>
        </motion.div>
      )}

      {isMobile ? (
        <div className="grid grid-cols-3 gap-6 max-w-md">
          {[
            { value: 31, suffix: "", prefix: "", label: "Países mapeados" },
            { value: 141, suffix: "+", prefix: "", label: "Artigos e guias" },
            { value: 36, suffix: "", prefix: "", label: "Ferramentas disponíveis" },
          ].map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F111A] truncate">
                {s.value.toLocaleString("pt-BR")}{s.suffix}
              </p>
              <p className="text-xs sm:text-sm text-[#5E6278] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="grid grid-cols-3 gap-6 max-w-md"
        >
          {[
            { value: 31, suffix: "", prefix: "", label: "Países mapeados" },
            { value: 141, suffix: "+", prefix: "", label: "Artigos e guias" },
            { value: 36, suffix: "", prefix: "", label: "Ferramentas disponíveis" },
          ].map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F111A] truncate">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-[#5E6278] font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </>
  );

  return (
    <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <ParticleCanvasThemed opacity={0.35} particleCount={25} connectionDist={140} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.06),transparent)] z-[2]" />
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
          {isMobile ? (
            <div>{heroContent}</div>
          ) : (
            <motion.div style={{ y: y1 }}>{heroContent}</motion.div>
          )}

          {!isMobile && (
            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0, x: 60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="relative hidden lg:flex items-center justify-center h-[450px]"
            >
              <div className="relative w-[380px] h-[380px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-[#D80E16]/15"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.1, 0.4],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8 + i * 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 1.5,
                    }}
                    style={{
                      width: `${100 - i * 15}%`,
                      height: `${100 - i * 15}%`,
                      left: `${(i * 15) / 2}%`,
                      top: `${(i * 15) / 2}%`,
                    }}
                  />
                ))}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  const radius = 140 + (i % 3) * 25;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#D80E16]/30"
                      style={{ left: `calc(50% + ${x}px - 4px)`, top: `calc(50% + ${y}px - 4px)` }}
                      animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.3, 0.8] }}
                      transition={{ duration: 3 + i * 0.35, repeat: Infinity, delay: i * 0.25 }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#0F111A]/20 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-[#D80E16]"
          />
        </div>
      </motion.div>
    </section>
  );
}


/* ═══════════════════════════════════════
   PLANS SECTION
   ═══════════════════════════════════════ */
const PLANS = [
  {
    name: "Essential",
    price: "R$ 0",
    period: "/mês",
    description: "Ideal para quem está começando a explorar o comércio exterior",
    features: [
      "2 consultas IA NCM por mês",
      "Exportação Intelligence (5 buscas/dia)",
      "Visualização de estatísticas gerais",
      "Suporte por email",
    ],
    unavailable: [
      "Importação/Exportação Intelligence completo",
      "Mapas interativos",
      "Alertas automáticos",
      "Consultas de importadores/exportadores mundiais",
      "Cálculos de impostos por país",
    ],
    cta: "Começar Grátis",
    highlighted: false,
    route: "/register",
  },
  {
    name: "Growth",
    price: "R$ 289",
    period: "/mês",
    description: "Para empresas que estão começando a exportar",
    features: [
      "IA NCM ilimitada (via tanque)",
      "Import/Export Intelligence completo",
      "Todas as ferramentas liberadas",
      "Smart Rank, Alertas, Análise Avançada",
      "Suporte por email",
    ],
    unavailable: [
      "Exportação CSV/PDF",
      "Uso ilimitado sem tanque",
    ],
    cta: "Assinar Growth",
    highlighted: false,
    route: "/register?plan=growth",
  },
  {
    name: "Business",
    price: "R$ 3.200",
    period: "/mês",
    description: "Tudo ilimitado. Sem preocupações com limite de uso.",
    features: [
      "Tudo do Growth + ilimitado",
      "IA NCM — sem limites de consulta",
      "Import/Export Intelligence — sem limites",
      "Exportação CSV e PDF liberada",
      "Suporte prioritário",
    ],
    unavailable: [],
    cta: "Assinar Business",
    highlighted: true,
    badge: "ILIMITADO",
    route: "/register?plan=business",
  },
];

function PlansSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="Planos"
          title={<>Escolha seu{" "}<span className="text-[#D80E16]">plano</span></>}
          subtitle="Comece grátis. Sem cartão. Upgrade quando quiser."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <SpotlightCard className={`rounded-2xl p-6 lg:p-8 h-full relative overflow-visible ${
                plan.highlighted
                  ? "bg-gradient-to-br from-[#D80E16] to-[#b80c12] text-white shadow-xl shadow-[#D80E16]/20 ring-4 ring-[#D80E16]/10"
                  : "bg-white border border-black/[0.06] shadow-[0_4px_24px_-12px_rgba(15,17,26,0.1)]"
              }`}>
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#D80E16] font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg">
                    {plan.badge}
                  </Badge>
                )}

                <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${plan.highlighted ? "text-white/60" : "text-[#5E6278]"}`}>
                  {plan.name}
                </div>
                <div className="text-4xl font-extrabold mb-1">{plan.price}</div>
                {plan.period ? <div className={`text-sm font-medium mb-5 ${plan.highlighted ? "text-white/60" : "text-[#5E6278]"}`}>{plan.period}</div> : <div className="mb-5" />}
                <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? "text-white/80" : "text-[#5E6278]"}`}>{plan.description}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white" : "text-[#10b981]"}`} />
                      <span className={plan.highlighted ? "text-white/90" : "text-[#0F111A]"}>{f}</span>
                    </li>
                  ))}
                  {plan.unavailable.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm opacity-50">
                      <span className="w-4 h-4 mt-0.5 shrink-0 rounded-full border border-current flex items-center justify-center text-[8px]">×</span>
                      <span className={plan.highlighted ? "text-white/60" : "text-[#5E6278]"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full rounded-xl h-12 font-bold ${
                  plan.highlighted
                    ? "bg-white text-[#D80E16] hover:bg-slate-100"
                    : "bg-[#D80E16] text-white hover:bg-[#b80c12]"
                }`} asChild>
                  <Link to={plan.route}>{plan.cta}</Link>
                </Button>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════
   FAQ
   ═══════════════════════════════════════ */
const FAQ = [
  {
    q: "O plano grátis tem limitações?",
    a: "O plano Essential é gratuito e oferece acesso a estatísticas gerais e 2 consultas IA NCM por mês. Além disso, várias ferramentas são completamente gratuitas e nem exigem cadastro: Supply Chain Map (navios e aviões ao vivo), Track & Trace (rastreamento de cargas) e Rastreamento de Container. Para recursos avançados como Trade Intelligence e Smart Rank, recomendamos os planos Growth ou Business.",
  },
  {
    q: "Preciso pagar para testar as ferramentas?",
    a: "Não. O plano Essential é 100% gratuito e sem necessidade de cartão de crédito. Além disso, o Supply Chain Map, Track & Trace e Rastreamento de Carga são ferramentas livres que qualquer pessoa pode usar sem cadastro — basta acessar e começar a usar.",
  },
  {
    q: "Como funciona o limite de uso?",
    a: "Cada plano tem uma barra de uso mensal de 100%. Cada ação (consulta, busca, classificação IA) consome uma pequena porcentagem. Planos superiores têm custo por ação reduzido, permitindo muito mais consultas por mês. Ferramentas gratuitas como Supply Chain Map e Track & Trace não consomem créditos.",
  },
  {
    q: "Como funciona o classificador NCM com IA?",
    a: "Descreva o produto em linguagem natural (ex: 'máquina de corte a laser para tecidos') e nossa IA retorna o código NCM/HS/HTS mais adequado, com descrição completa, alíquotas e restrições aplicáveis. O classificador cobre toda a tabela NCM brasileira e também gera o HS code internacional.",
  },
  {
    q: "Os dados são atualizados com que frequência?",
    a: "Dados de comércio exterior são atualizados mensalmente com registros oficiais. Tarifas de importação de 31 países são mantidas atualizadas. Alertas e notificações são processados em tempo real. O Supply Chain Map e Track & Trace usam dados AIS e ADS-B ao vivo.",
  },
  {
    q: "Posso usar a TRADEXA para encontrar compradores internacionais?",
    a: "Sim. O Diretório de Importadores tem 3.8M+ empresas classificadas por código HS em 97 países. Os planos Growth e Business incluem busca avançada com filtros por país, porte e categoria de produto. Para prospecção personalizada, oferecemos o serviço de Pesquisa de Compradores Internacionais.",
  },
  {
    q: "Quais ferramentas são gratuitas e não precisam de cadastro?",
    a: "O Supply Chain Map (navios, aviões e portos ao vivo), Track & Trace (rastreamento de navios e aeronaves) e Rastreamento de Carga (DHL, FedEx, UPS, Maersk) são 100% gratuitos e abertos — sem cadastro, sem limite. Basta acessar e usar.",
  },
];

function FAQSection() {
  return (
    <section className="relative pt-8 md:pt-12 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <SectionHeader badge="FAQ" title="Dúvidas frequentes" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}
                className="rounded-xl border border-black/[0.06] bg-white px-6 py-1 shadow-[0_2px_12px_-6px_rgba(15,17,26,0.08)] data-[state=open]:border-[#D80E16]/20 transition-all"
              >
                <AccordionTrigger className="text-left font-bold text-[#0F111A] hover:no-underline py-4 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#5E6278] text-sm leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   SERVICES GRID (removed — now in PlatformModulesSection)
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   CTA FINAL
   ═══════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F111A] via-[#1a1a2e] to-[#0F111A]" />
      <div className="absolute inset-0 opacity-30">
        <ParticleCanvasThemed opacity={0.25} particleCount={30} color="255, 255, 255" connectionDist={110} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Comece a explorar{" "}
            <span className="text-[#D80E16]">agora.</span>
          </h2>
          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Grátis para começar. Sem cartão. Acesse dados reais do comércio exterior brasileiro em segundos e transforme sua estratégia de mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-2xl h-14 px-8 font-bold text-base shadow-[0_0_50px_rgba(216,14,22,0.4)] hover:shadow-[0_0_70px_rgba(216,14,22,0.6)] transition-all border-0 btn-glow"
              asChild
            >
              <Link to="/register">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl h-14 px-8 font-bold text-base border-white/30 text-white/90 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:text-white transition-all"
              asChild
            >
              <Link to="/login">Entrar na Plataforma</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export default function HomePage() {
  useSeo({
    title: "TRADEXA — Plataforma de Comércio Exterior",
    description: "Plataforma de comércio exterior: classificação NCM com IA, tarifas de 31 países, rastreamento de cargas ao vivo e serviços de frete. Da análise ao desembaraço.",
    keywords: "comércio exterior, importação, exportação, NCM, frete marítimo, inteligência comercial, trade intelligence, supply chain, rastreamento cargas, classificação fiscal, desembaraço aduaneiro",
    canonical: "https://www.tradexa.com.br",
  });
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TRADEXA - Plataforma de Comércio Exterior",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.tradexa.com.br",
    "screenshot": "https://www.tradexa.com.br/og-image.png",
    "description": "Plataforma de comércio exterior com classificação NCM com IA, tarifas globais, diretório de importadores, rastreamento de cargas ao vivo, frete marítimo e trade intelligence.",
    "featureList": [
      "Classificacao NCM com IA",
      "Tarifas Globais em 31 paises",
      "Diretorio de Importadores",
      "Mapa de Frete Maritimo",
      "Supply Chain Map ao vivo",
      "Track & Trace",
      "Trade Intelligence"
    ],
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "3200",
      "priceCurrency": "BRL",
      "offerCount": "3",
      "offers": [
        {
          "@type": "Offer",
          "name": "Essential",
          "price": "0",
          "priceCurrency": "BRL",
          "description": "Plano gratuito com 10 ferramentas basicas"
        },
        {
          "@type": "Offer",
          "name": "Growth",
          "price": "289",
          "priceCurrency": "BRL",
          "description": "Para empresas que estao comecando a exportar"
        },
        {
          "@type": "Offer",
          "name": "Business",
          "price": "3200",
          "priceCurrency": "BRL",
          "description": "Tudo ilimitado. Sem limites de uso"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "2847",
      "reviewCount": "1203"
    },
    "author": {
      "@type": "Organization",
      "name": "TRADEXA",
      "url": "https://www.tradexa.com.br"
    },
    "applicationSuite": "Comércio Exterior"
  };

  return (
      <div className="min-h-screen flex flex-col text-[#0F111A] overflow-x-hidden">
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(softwareApplicationSchema)}
          </script>
        </Helmet>
        <Header />
        <HeroSection />
        <StatsBarSection />
        <WhatIsTradexaSection />
        <PlatformModulesSection />
        <PlansSection />
        <NewsletterSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
  );
}
