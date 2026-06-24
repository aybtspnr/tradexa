"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight, Globe, TrendingUp, BarChart3, MapPin, Zap,
  Shield, Database, Bot, ChevronRight, Layers, BellRing,
  ChevronDown, Check, Star, Play, Sparkles, ArrowUpRight,
  Building2, Boxes, Radar, Compass, FileSearch, Mail
} from "lucide-react";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { useSeo } from "@/hooks/use-seo";
import { Toaster } from "@/components/ui/sonner";
import StructuredData from "@/components/StructuredData";

/* ────────────────────────────
   ANIMATED COUNTER
   ──────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ────────────────────────────
   PARTICLE CANVAS (fundo vivo)
   ──────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles: { x:number; y:number; vx:number; vy:number; size:number; alpha:number }[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
      });
    }
    let anim = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 14, 22, ${p.alpha})`; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 180) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(216, 14, 22, ${0.04 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ────────────────────────────
   3D TILT CARD
   ──────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * -12, y: x * 12 });
  };
  const handleLeave = () => setRotate({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────
   ANIMATION VARIANTS
   ──────────────────────────── */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

/* ═══════════════════════════════════════
   LANDING PAGE — HÍBRIDA MARKETING + SAAS
   ═══════════════════════════════════════ */
export default function LandingPage() {
  useSeo({
    title: "TRADEXA — Inteligência de Mercado para Comércio Exterior",
    description: "Plataforma de inteligência comercial. Classificador IA de NCM, alíquotas de 31 países, importadores globais e mapas logísticos ao vivo.",
    keywords: "comércio exterior Brasil, NCM, HTS, importação, exportação, inteligência de mercado",
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Toaster />
      <StructuredData type="FAQ" faqItems={FAQ.map(item => ({ question: item.q, answer: item.a }))} />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 overflow-hidden mesh-hero">
        <ParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white/60 to-slate-50 pointer-events-none z-[1]" />

        {/* Stats bar flutuante */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="glass-hero rounded-2xl px-6 py-3 flex items-center gap-6 md:gap-10">
            {[{ label: "NCMs", val: 12000, suf: "+" }, { label: "Países", val: 190, suf: "" }, { label: "Municípios", val: 5570, suf: "" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="stat-gradient-value text-xl md:text-2xl"><AnimatedCounter target={s.val} suffix={s.suf} /></div>
                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <Logo className="h-14 mx-auto mb-6" to="/" />
          
          <Badge className="mb-6 glow-btn bg-[#D80E16]/10 text-[#D80E16] border border-[#D80E16]/20 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Dados Oficiais em Tempo Real
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-slate-900">
            O Comércio Exterior
            <br />
            <span className="text-[#D80E16] glow-text-red">
              Descomplicado por IA
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Análise inteligente de exportação, importação, NCMs e tendências globais — 
            tudo em uma plataforma, com dados atualizados do governo brasileiro e visão internacional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button className="glow-btn bg-[#D80E16] hover:bg-[#E50716] text-white rounded-2xl h-14 px-10 font-black gap-2 text-lg shadow-[0_0_40px_rgba(216,14,22,0.35)] hover:shadow-[0_0_60px_rgba(216,14,22,0.5)] transition-all">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-2 border-slate-200 text-slate-700 hover:border-[#D80E16]/30 hover:bg-[#D80E16]/5 hover:text-[#D80E16] transition-all">
                Já tenho conta
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mini preview cards flutuantes */}
          <motion.div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto" variants={container} initial="hidden" animate="show">
            {[
              { label: "Exportação", icon: TrendingUp, stat: "2.4T", color: "#D80E16" },
              { label: "Importação", icon: BarChart3, stat: "1.8T", color: "#2563EB" },
              { label: "Países", icon: Globe, stat: "190+", color: "#10B981" },
              { label: "Alertas Ativos", icon: BellRing, stat: "1.2M", color: "#8B5CF6" },
            ].map((item) => (
              <motion.div key={item.label} variants={fadeUp}>
                <TiltCard>
                  <div className="glass-card rounded-xl p-4 text-center shine-effect">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 card-icon-wrap" style={{ background: item.color + "15" }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="text-xl font-black text-slate-900">{item.stat}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.label}</div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-[#D80E16]" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ MÓDULOS — CARDS 3D EXPANDÍVEIS ═══════ */}
      <section className="py-24 px-4 bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute inset-0 mesh-dark opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            badge="Funcionalidades"
            title={<>5 Módulos. Um objetivo: <span className="text-[#D80E16]">inteligência.</span></>}
            subtitle="Expanda cada card para conhecer as ferramentas. Clique em Explorar para acessar a plataforma."
          />

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m) => (
              <ModuleCard key={m.title} {...m} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ DIFERENCIAIS ═══════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="Por que TRADEXA"
            title={<>Dados que <span className="text-[#D80E16]">realmente importam</span></>}
            subtitle="Sem informações inventadas. Tudo verificado e processado em tempo real."
          />

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Database, title: "Dados Oficiais", desc: "Base do Ministério da Indústria e Comércio integrada diretamente. Exportação/importação sem delay." },
              { icon: Bot, title: "Análise com IA", desc: "IA avançada analisa seus dados automaticamente. Insights, tendências e recomendações em segundos." },
              { icon: MapPin, title: "Mapa Interativo", desc: "Visualize quais municípios exportam/importam cada produto. Clique nos pontos para detalhes." },
              { icon: Layers, title: "Comparação NCM", desc: "Cruze dois códigos NCM lado a lado. Compare volume, valor, países e períodos." },
              { icon: Globe, title: "Dados Globais", desc: "Dados internacionais para visão completa do seu mercado." },
              { icon: Shield, title: "100% Transparente", desc: "Nada de dados falsos. Cada número é verificado. Confiança para decisões estratégicas." },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}>
                <TiltCard>
                  <div className="glass-card shine-effect rounded-2xl p-6 h-full relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80E16]/3 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
                    <div className="w-12 h-12 rounded-xl bg-[#D80E16]/10 flex items-center justify-center mb-4 card-icon-wrap">
                      <f.icon className="w-6 h-6 text-[#D80E16]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ DEPoIMENTOS ═══════ */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <SectionHeader badge="Quem usa" title="O que dizem nossos usuários" subtitle="" />
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <div className="glass-card rounded-2xl p-6 h-full relative">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D80E16] to-[#FF4444] flex items-center justify-center text-white font-black text-sm">{t.initials}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-600">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ PLANS ═══════ */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-hero opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeader badge="Planos" title={<>Escolha o seu <span className="text-[#D80E16]">plano</span></>} subtitle="Comece grátis. Sem cartão. Upgrade quando quiser." />

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <div className={`rounded-2xl p-6 h-full relative ${plan.highlight ? "bg-gradient-to-br from-[#D80E16] to-[#B00C12] text-white shadow-xl shadow-[#D80E16]/20 ring-4 ring-[#D80E16]/10" : "glass-card"}`}>
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#D80E16] font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${plan.highlight ? "text-white/70" : "text-slate-600"}`}>{plan.tier}</div>
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <div className="text-4xl font-black mb-6">
                    {plan.price}
                    <span className={`text-sm font-medium ${plan.highlight ? "text-white/60" : "text-slate-600"}`}>/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-white" : "text-[#D80E16]"}`} />
                        <span className={plan.highlight ? "text-white/90" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button className={`w-full rounded-xl h-12 font-black ${plan.highlight ? "bg-white text-[#D80E16] hover:bg-slate-100" : "bg-[#D80E16] text-white hover:bg-[#E50716]"}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-24 px-4 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto">
          <SectionHeader badge="FAQ" title="Dúvidas frequentes" subtitle="" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-0 px-6 py-1 data-[state=open]:border-[#D80E16]/20 transition-all">
                  <AccordionTrigger className="text-left font-bold text-slate-900 hover:no-underline py-4">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm pb-4">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#D80E16]/5 to-slate-900 pointer-events-none" />
        <div className="absolute inset-0 mesh-dark opacity-50 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Comece a explorar{" "}
              <span className="text-[#D80E16] glow-text-red">agora.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
              Grátis para começar. Sem cartão. Acesse dados reais do comércio exterior 
              brasileiro em segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="glow-btn bg-[#D80E16] hover:bg-[#E50716] text-white rounded-2xl h-14 px-10 font-black gap-2 text-lg shadow-[0_0_50px_rgba(216,14,22,0.5)] hover:shadow-[0_0_80px_rgba(216,14,22,0.7)] transition-all">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-white/20 text-white hover:bg-white/5 hover:text-white transition-all">
                  Entrar na Plataforma
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ────────────────────────────
   SECTION HEADER COMPONENT
   ──────────────────────────── */
function SectionHeader({ badge, title, subtitle }: { badge: string; title: React.ReactNode; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
      <Badge className="mb-4 bg-[#D80E16]/10 text-[#D80E16] border-0 font-bold text-xs uppercase tracking-widest px-3 py-1">
        {badge}
      </Badge>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-600 max-w-xl mx-auto">{subtitle}</p>}
      <div className="gradient-divider mt-8 max-w-xs mx-auto" />
    </motion.div>
  );
}

/* ────────────────────────────
   MODULE CARD — EXPANDABLE
   ──────────────────────────── */
function ModuleCard({ title, desc, icon: Icon, color, features, to }: typeof MODULES[0]) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp}>
      <TiltCard>
        <div className="glass-card rounded-2xl overflow-hidden h-full shine-effect relative">
          <div className="absolute top-0 right-0 w-40 h-40 opacity-30 rounded-full blur-3xl -translate-y-16 translate-x-12 pointer-events-none" style={{ background: color }} />
          
          <button onClick={() => setOpen(!open)} className="w-full text-left p-6 relative z-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center card-icon-wrap" style={{ background: color + "15" }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{title}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Clique para expandir</p>
                </div>
              </div>
              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-5 h-5 text-slate-300 mt-2" />
              </motion.div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {features.map((f) => (
                      <span key={f} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">{f}</span>
                    ))}
                  </div>
                  <Link to={to}>
                    <Button className="w-full rounded-xl h-10 font-bold gap-2 text-sm" style={{ background: color, color: "#fff" }}>
                      Explorar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */
const MODULES = [
  {
    title: "Exportação Intelligence",
    desc: "Dados oficiais de exportação brasileira por NCM, país, UF e município. Filtros avançados e análise IA.",
    icon: TrendingUp, color: "#D80E16",
    features: ["NCM Search", "Mapa de Municípios", "Alertas", "Relatórios IA"],
    to: "/export-intelligence",
  },
  {
    title: "Importação Intelligence",
    desc: "Dados de importação brasileira. Análise por país de origem, porto de entrada e evolução mensal.",
    icon: BarChart3, color: "#2563EB",
    features: ["Importadores", "Ranking", "Tendências", "Alertas de Preço"],
    to: "/import-intelligence",
  },
  {
    title: "Saldo Comercial",
    desc: "Compare exportação vs importação para qualquer NCM. Identifique déficits e superávits.",
    icon: Layers, color: "#10B981",
    features: ["Comparação Cruzada", "Gráficos", "IA Insights", "Exportar PDF"],
    to: "/trade-balance",
  },
  {
    title: "Mapa de Municípios",
    desc: "Visualize no mapa quais cidades exportam ou importam seu produto. Clique para detalhes.",
    icon: MapPin, color: "#8B5CF6",
    features: ["Mapa Interativo", "Filtros", "Ranking", "Exportar"],
    to: "/export-intelligence/map",
  },
  {
    title: "Comparador NCM",
    desc: "Compare dois códigos NCM lado a lado. Volume, valor, países destino — tudo cruzado.",
    icon: Zap, color: "#F59E0B",
    features: ["Dual Compare", "Gráficos", "Timeline", "Exportar"],
    to: "/ncm-comparison",
  },
  {
    title: "Alertas em Tempo Real",
    desc: "Configure alertas para variações de preço, volume ou novos mercados para seus produtos.",
    icon: BellRing, color: "#EC4899",
    features: ["Preço", "Volume", "Novos Mercados", "Email/Notif"],
    to: "/export-intelligence/alertas",
  },
];

const TESTIMONIALS = [
  { name: "Carlos M.", role: "Diretor de Exportação", initials: "CM", quote: "A plataforma economizou 60% do nosso tempo de pesquisa de mercado. Encontramos 3 novos importadores em 2 semanas." },
  { name: "Ana P.", role: "Analista de Comércio Exterior", initials: "AP", quote: "Finalmente uma ferramenta que junta dados atualizados com IA. Os insights de tendência são precisos e úteis." },
  { name: "Roberto S.", role: "CEO Trading Company", initials: "RS", quote: "O módulo de saldo comercial mudou como analisamos oportunidades. Identificamos nichos que não víamos antes." },
];

const PLANS = [
  {
    tier: "Grátis", name: "Essential", price: "R$0",
    features: ["2 consultas IA NCM", "Classificação inteligente", "Acesso ao dashboard", "Sem compromisso"],
    cta: "Começar Grátis", highlight: false,
  },
  {
    tier: "Premium", name: "Growth", price: "R$497",
    features: ["Consultas IA NCM", "Consulta HTS EUA", "Comparar NCMs", "Simular Exportação", "Alíquotas por País", "Suporte por email"],
    cta: "Assinar Growth", highlight: false,
  },
  {
    tier: "Premium", name: "Professional", price: "R$1.297",
    features: ["Tudo do Growth", "Smart Rank", "Alertas de Tarifas", "Análise Avançada", "Mapa de Importadores", "Calendário Sazonal", "Frete Marítimo", "Port Intelligence", "Suporte prioritário"],
    cta: "Assinar Professional", highlight: true, badge: "MAIS POPULAR",
  },
  {
    tier: "Empresarial", name: "Business", price: "R$4.799+",
    features: ["Tudo do Professional", "API customizada", "Limites personalizados", "Onboarding dedicado"],
    cta: "Falar com Vendas", highlight: false,
  },
];

const FAQ = [
  { q: "Os dados são realmente oficiais?", a: "Sim. Integramos diretamente dados atualizados de comércio exterior brasileiro e internacional. Zero estimativas." },
  { q: "Preciso de cartão para começar?", a: "Não. O plano Essential é 100% grátis, sem cartão, sem compromisso. Você pode usar as funcionalidades básicas sem pagar nada." },
  { q: "O que a IA analisa exatamente?", a: "Nossa IA analisa automaticamente dados de exportação/importação para identificar tendências, recomendar mercados e detectar variações de preço." },
  { q: "Posso exportar dados?", a: "Sim. A partir do plano Professional, você pode acessar dados via API. No plano Business, acesso à API customizada também está disponível." },
  { q: "Até quando os dados são atualizados?", a: "Os dados atualizados são atualizados mensalmente. Alertas e notificações são processados diariamente." },

];
