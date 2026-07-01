/** Shared layout component — Header + Footer para páginas públicas (about, terms, privacy, contact, landing pages). */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronRight, Sparkles, ChevronDown, Menu, X,
  Search, Globe, BarChart3, TrendingUp, Map, Database,
  Package, BellRing, Zap, Shield, Activity, Ship, Navigation, Briefcase, Building2, Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo3D } from "@/components/Logo3D";
import Breadcrumbs from "@/components/Breadcrumbs";

// ═══════════════ HEADER ═══════════════
function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { const onClick = (e: MouseEvent) => { if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false); }; document.addEventListener("mousedown", onClick); return () => document.removeEventListener("mousedown", onClick); }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);

  const navBase = "px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative flex items-center gap-1.5";
  const navActive = "text-[#D80E16] bg-[#D80E16]/[0.06]";
  const navInactive = "text-[#5E6278] hover:text-[#0F111A] hover:bg-black/[0.04]";

  const toolLinks = [
    { label: "Classificador IA NCM", href: "/landing/ncm-classifier", icon: <Search className="w-4 h-4" />, color: "#D80E16", desc: "Classificação automática de produtos" },
    { label: "Track & Trace", href: "/track-trace", icon: <Navigation className="w-4 h-4" />, color: "#D80E16", desc: "Navios e aviões ao vivo" },
    { label: "Tarifário Global", href: "/landing/tariff-calculator", icon: <Globe className="w-4 h-4" />, color: "#f59e0b", desc: "Alíquotas em 31 países" },
    { label: "Trade Intelligence", href: "/landing/import-dashboard", icon: <BarChart3 className="w-4 h-4" />, color: "#10b981", desc: "Dados de importação e exportação" },
    { label: "Smart Rank", href: "/landing/export-opportunities", icon: <TrendingUp className="w-4 h-4" />, color: "#8b5cf6", desc: "Ranking de países" },
    { label: "Mapa de Importadores", href: "/landing/import-map", icon: <Map className="w-4 h-4" />, color: "#06b6d4", desc: "Geolocalização de operações" },
    { label: "Diretório Importadores", href: "/landing/importadores", icon: <Database className="w-4 h-4" />, color: "#ef4444", desc: "Milhões de empresas por HS" },
    { label: "Mapa de Frete Marítimo", href: "/maritime-freight-map", icon: <Ship className="w-4 h-4" />, color: "#D80E16", desc: "Rotas e cotações interativas no mapa" },
    { label: "Supply Chain Map", href: "/supply-chain", icon: <Activity className="w-4 h-4" />, color: "#1e3a5f", desc: "Mapa logístico global ao vivo" },
    { label: "Perfil Global Empresa", href: "/company-global-profile", icon: <Building2 className="w-4 h-4" />, color: "#8b5cf6", desc: "CNPJ com contexto global" },
    { label: "Radar de Concorrência", href: "/radar-concorrencia", icon: <Radio className="w-4 h-4" />, color: "#D80E16", desc: "Concorrentes por NCM e mercado" },
    { label: "Comparador Global", href: "/global-trade-comparison", icon: <Globe className="w-4 h-4" />, color: "#3b82f6", desc: "Brasil vs China, EUA e Alemanha" },
    { label: "NCM Global Dashboard", href: "/ncm-global-dashboard", icon: <BarChart3 className="w-4 h-4" />, color: "#10b981", desc: "Dashboard com dados globais" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_4px_30px_-15px_rgba(15,17,26,0.1)]"
    >
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute top-0 left-0 right-0 h-[1.5px] origin-left"
        style={{ background: "linear-gradient(90deg, transparent, #D80E16, #FF5555, #D80E16, transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo3D className="h-8 md:h-9" />
        </Link>
        <nav className="hidden lg:flex items-center gap-0.5">
          <Link to="/" className={`${navBase} ${navInactive}`}><Sparkles className="w-4 h-4" />Início</Link>
          <div ref={toolsRef} className="relative">
            <button onClick={() => setToolsOpen(!toolsOpen)} className={`${navBase} ${navInactive}`}><Zap className="w-4 h-4" />Plataforma<motion.span animate={{ rotate: toolsOpen ? 180 : 0 }}><ChevronDown className="w-3.5 h-3.5" /></motion.span></button>
            <AnimatePresence>
              {toolsOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[360px] bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.06] shadow-2xl overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-black/[0.04]"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Plataforma</p></div>
                  <div className="p-2">
                    {toolLinks.map((s, i) => (
                      <motion.div key={s.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={s.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/[0.03] group transition-all">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ background: s.color }}>{s.icon}</span>
                          <div className="flex-1 min-w-0"><span className="text-[#0F111A] font-bold text-sm">{s.label}</span><span className="text-[10px] text-[#5E6278] block">{s.desc}</span></div>
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
          <Link to="/pricing" className={`${navBase} ${navInactive}`}><Shield className="w-4 h-4" />Planos</Link>
          <Link to="/sobre" className={`${navBase} ${navInactive}`}><Sparkles className="w-4 h-4" />Sobre</Link>
        </nav>
        <div className="hidden lg:flex items-center gap-2.5">
          <Button variant="ghost" size="sm" className="rounded-xl text-[#5E6278] hover:text-[#0F111A]" asChild><Link to="/login">Entrar</Link></Button>
          <Button size="sm" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl shadow-lg shadow-[#D80E16]/20 border-0" asChild><Link to="/register"><Sparkles className="w-3.5 h-3.5" />Começar<ArrowRight className="w-3.5 h-3.5" /></Link></Button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="lg:hidden p-2 rounded-xl text-[#0F111A] hover:bg-black/[0.04]">{menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-0 right-0 h-dvh w-[320px] max-w-[90vw] bg-white border-l border-black/[0.06] shadow-2xl z-50 flex flex-col">
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between"><Logo3D className="h-7" /><button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl text-[#5E6278] hover:bg-black/[0.04]"><X className="w-5 h-5" /></button></div>
              <div className="flex-1 overflow-auto p-4 space-y-1">
                <MobileLink to="/" label="Início" icon={<Sparkles className="w-4 h-4" />} />
                <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Plataforma</div>
                {toolLinks.map(s => <MobileLink key={s.href} to={s.href} label={s.label} icon={<span className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px]" style={{ background: s.color }}>{s.icon}</span>} />)}
                <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6278]">Mais</div>
                <MobileLink to="/servicos" label="Serviços" icon={<Briefcase className="w-4 h-4" />} />
                <MobileLink to="/pricing" label="Planos" icon={<Shield className="w-4 h-4" />} />
                <MobileLink to="/sobre" label="Sobre" icon={<Sparkles className="w-4 h-4" />} />
              </div>
              <div className="p-4 border-t border-black/[0.06] space-y-2"><Button variant="outline" className="w-full rounded-xl h-11 font-bold" asChild><Link to="/login">Entrar</Link></Button><Button className="w-full gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl h-11 font-bold" asChild><Link to="/register"><Sparkles className="w-4 h-4" />Começar Grátis</Link></Button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MobileLink({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return <Link to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-[#0F111A] hover:bg-black/[0.03] transition-all">{icon}{label}</Link>;
}

// ═══════════════ FOOTER ═══════════════
function SiteFooter() {
  return (
    <footer className="bg-[#0F111A] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Logo + tagline — linha própria */}
        <div className="mb-12 text-center md:text-left">
          <Logo3D className="h-7 mb-3 mx-auto md:mx-0" variant="white" />
          <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto md:mx-0">
            Inteligência de mercado para comércio exterior com dados atualizados.
          </p>
        </div>

        {/* Colunas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {[
            { title: "Consultoria", links: [
              { label: "Pesquisa de Mercado para Exportação", href: "/servicos/pesquisa-mercado-exportacao" },
              { label: "Pesquisa de Compradores Internacionais", href: "/servicos/pesquisa-compradores" },
              { label: "Cotação de Frete Internacional", href: "/servicos/cotacao-frete-internacional" },
              { label: "Despacho Aduaneiro", href: "/servicos/despacho-aduaneiro" },
              { label: "Fulfillment Internacional", href: "/servicos/fulfillment" },
              { label: "Representação Comercial no Brasil", href: "/servicos/representacao-brasil" },
              { label: "Auditoria de Classificação Fiscal", href: "/servicos/auditoria-classificacao-fiscal" },
              { label: "Frete Internacional Gerenciado", href: "/servicos/agenciamento-carga" },
            ]},
            { title: "Inteligência", links: [
              { label: "AI Search", href: "/ai-search" },

              { label: "HS Lookup EUA", href: "/hts-lookup" },

              { label: "Tarifário Global", href: "/global-tariff" },
              { label: "Inteligência Comercial", href: "/intelligence" },
              { label: "Diretório de Importadores", href: "/importadores" }, 
              { label: "Importadores Potenciais", href: "/potential-importers" },
              { label: "Mapa Comercial", href: "/importers-map" },


              { label: "Análise Avançada", href: "/trade-intelligence" },
              { label: "Supply Chain", href: "/supply-chain" },
              { label: "Notícias", href: "/noticias" },
              { label: "Perfil Global Empresa", href: "/company-global-profile" },
              { label: "Radar de Concorrência", href: "/radar-concorrencia" },
              { label: "Comparador Global", href: "/global-trade-comparison" },
              { label: "NCM Global Dashboard", href: "/ncm-global-dashboard" },
            ]},
            { title: "Ferramentas", links: [

              { label: "Calculadora Incoterms", href: "/ferramentas/calculadora-incoterms" },
              { label: "Calculadora ACC/ACE", href: "/ferramentas/calculadora-acc-ace" },
              { label: "Calculadora de Drawback", href: "/ferramentas/calculadora-drawback" },
              { label: "Calculadora de Precificação", href: "/ferramentas/precificacao-exportacao" },
              { label: "Gerador de Documentos", href: "/ferramentas/gerador-documentos" },
              { label: "Conformidade Regulatória", href: "/ferramentas/conformidade-regulatoria" },
              { label: "Comparador de Portos", href: "/ferramentas/comparador-portos" },
              { label: "Simulador de Acordos", href: "/ferramentas/simulador-acordos-comerciais" },
              { label: "Calculadora de Carbono", href: "/ferramentas/calculadora-carbono" },
              { label: "Calendário Aduaneiro", href: "/calendario-aduaneiro" },

              { label: "Mapa de Frete", href: "/maritime-freight-map" },
              { label: "Track & Trace", href: "/track-trace" },
              { label: "Rastreamento de Carga", href: "/rastreamento" },
              { label: "Port Intelligence EUA", href: "/port-intelligence" },
            ]},
            { title: "Aprenda", links: [
              { label: "Blog", href: "/blog" },
              { label: "Tutoriais", href: "/tutorial" },
              { label: "Guia de Exportação", href: "/guia-exportacao" },
              { label: "Guia de Importação", href: "/guia-importacao" },
              { label: "Guia NCM", href: "/guia-ncm" },
              { label: "Guia DUIMP 2026", href: "/guia-duimp" },
              { label: "Logística Internacional", href: "/logistica-internacional" },
              { label: "Feiras e Eventos", href: "/feiras-eventos" },
              { label: "Glossário", href: "/glossario" },
              { label: "Recursos", href: "/recursos" },
            ]},
            { title: "Links Úteis", links: [
              { label: "Comex Stat", href: "https://comexstat.mdic.gov.br/" },
              { label: "Siscomex", href: "https://www.gov.br/siscomex/" },
              { label: "ApexBrasil", href: "https://apexbrasil.com.br/" },
              { label: "MDIC", href: "https://www.gov.br/mdic/" },
              { label: "Receita Federal", href: "https://www.gov.br/receitafederal/" },
            ]},
            { title: "Institucional", links: [
              { label: "Sobre", href: "/sobre" },
              { label: "Planos", href: "/pricing" },
              { label: "Contato", href: "/contato" },
              { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
              { label: "Privacidade", href: "/privacidade" },
              { label: "Termos de Uso", href: "/termos" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-white mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-[#D80E16] transition-colors">{l.label}</a>
                    ) : (
                      <Link to={l.href} className="text-sm text-white/50 hover:text-[#D80E16] transition-colors">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] pt-8 text-center">
          <p className="text-xs text-white/60">© {new Date().getFullYear()} TRADEXA — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════ LAYOUT ═══════════════
export function SiteLayout({ children, noFooter, noBreadcrumbs }: { children: ReactNode; noFooter?: boolean; noBreadcrumbs?: boolean }) {
  // Tracking de páginas
  useEffect(() => {
    const page = window.location.pathname + window.location.search;
    const referrer = document.referrer || '';
    
    // Envia beacon para o VPS (fire-and-forget, não bloqueia)
    try {
      const payload = new Blob([JSON.stringify({ page, referrer })], { type: 'application/json' });
      navigator.sendBeacon('/api/track-page', payload);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-[#0F111A]">
      <SiteHeader />
      <main className={noFooter ? "pt-16 h-[calc(100vh-64px)]" : "flex-1 pt-16"}>
        {!noBreadcrumbs && <Breadcrumbs />}
        {children}
      </main>
      {noFooter ? null : (<>
      {/* CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F111A] via-[#1a1a2e] to-[#0F111A]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pronto para transformar seu comércio exterior?
          </p>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Comece gratuitamente hoje. Sem cartão de crédito. Acesso imediato a dados reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-2xl h-14 px-10 font-bold text-lg shadow-[0_0_50px_rgba(216,14,22,0.4)] border-0" asChild>
              <Link to="/register">Criar Conta Grátis <ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 font-bold border-white/30 text-white/90 bg-white/5 hover:bg-white/10" asChild>
              <Link to="/pricing">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
      </> )}
    </div>
  );
}
