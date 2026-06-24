import { Link } from "react-router-dom";
import {
  BarChart3, TrendingUp, Globe, Search, Ship,
  Navigation, Map, Database, BellRing, Brain,
  Calculator, FileText, Shield, Users, Package,
  Leaf, ArrowRight, Sparkles, Calculator as CalcIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const categories = [
  {
    title: "Inteligência de Mercado",
    icon: BarChart3,
    description: "Dados, análises e rankings para decisões estratégicas",
    items: [
      { label: "Trade Intelligence", route: "/landing/import-dashboard", desc: "Dashboard de importação e exportação" },
      { label: "Smart Rank", route: "/landing/export-opportunities", desc: "Ranking de países por oportunidade" },
      { label: "Market Intelligence", route: "/landing/market-intelligence", desc: "Análise competitiva de mercado" },
      { label: "Explorador Global", route: "/landing/global-explorer", desc: "Rotas de comércio em mapa interativo" },
      { label: "Mapa de Importações", route: "/landing/import-map", desc: "Distribuição geográfica das importações" },
      { label: "Arbitragem de Preços", route: "/landing/price-arbitrage", desc: "Compare preços entre 130+ países" },
    ],
  },
  {
    title: "Classificação e Tarifas",
    icon: Search,
    description: "Classifique produtos e calcule impostos de importação",
    items: [
      { label: "Classificador NCM com IA", route: "/landing/ncm-classifier", desc: "Classificação automática por linguagem natural" },
      { label: "Tarifário Global", route: "/landing/tariff-calculator", desc: "Alíquotas de importação em 31 países" },
      { label: "Calculadora de Impostos", route: "/landing/calculadora-importacao", desc: "II, IPI, PIS, COFINS e ICMS por estado" },
      { label: "Calculadora Incoterms", route: "/ferramentas/calculadora-incoterms", desc: "Compare os 11 Incoterms 2020" },
      { label: "Lista NCM Completa", route: "/landing/lista-ncm", desc: "Busca por código ou descrição" },
      { label: "Conformidade Regulatória", route: "/ferramentas/conformidade-regulatoria", desc: "ANVISA, INMETRO e órgãos reguladores" },
    ],
  },
  {
    title: "Rastreamento e Logística",
    icon: Ship,
    description: "Acompanhe cargas, navios e aviões em tempo real",
    items: [
      { label: "Supply Chain Map", route: "/landing/supply-chain", desc: "Mapa logístico global ao vivo", badge: "Grátis" },
      { label: "Track & Trace", route: "/landing/track-trace", desc: "Navios e aviões cargueiros ao vivo", badge: "Novo" },
      { label: "Mapa de Frete Marítimo", route: "/landing/maritime-freight-map", desc: "Cotações e rotas em globo 3D", badge: "Beta" },
      { label: "Rastreamento de Carga", route: "/landing/rastreamento", desc: "DHL, FedEx, UPS, Maersk e mais" },
      { label: "Frete Marítimo FCL", route: "/landing/maritime-freight", desc: "Cotações de container entre portos" },
      { label: "Comparador de Portos", route: "/ferramentas/comparador-portos", desc: "Custos, prazos e eficiência" },
    ],
  },
  {
    title: "Exportação",
    icon: TrendingUp,
    description: "Ferramentas para expandir seus negócios no exterior",
    items: [
      { label: "Dashboard de Exportação", route: "/landing/export-dashboard", desc: "Dados brasileiros por produto e destino" },
      { label: "Wizard de Exportação", route: "/landing/export-wizard", desc: "Guia passo a passo para novos exportadores" },
      { label: "Precificação de Exportação", route: "/ferramentas/precificacao-exportacao", desc: "Calcule o preço no mercado de destino" },
      { label: "Calculadora de Drawback", route: "/ferramentas/calculadora-drawback", desc: "Simule suspensão de tributos" },
      { label: "Calculadora ACC/ACE", route: "/ferramentas/calculadora-acc-ace", desc: "Financiamento à exportação" },
    ],
  },
  {
    title: "Importação",
    icon: Database,
    description: "Encontre fornecedores, importadores e gere documentos",
    items: [
      { label: "Diretório de Importadores", route: "/landing/importadores", desc: "3.8M+ empresas em 97 países" },
      { label: "Busca de Importadores", route: "/landing/import-search", desc: "Busca inteligente por NCM e empresa" },
      { label: "Gerador de Documentos", route: "/ferramentas/gerador-documentos", desc: "DI, LI e documentos aduaneiros" },
    ],
  },
  {
    title: "Alertas e Monitoramento",
    icon: BellRing,
    description: "Notificações e simulações para ficar à frente",
    items: [
      { label: "Alertas Inteligentes", route: "/landing/smart-alerts", desc: "Notificações de mercado em tempo real" },
      { label: "Calculadora de Carbono", route: "/ferramentas/calculadora-carbono", desc: "Pegada de carbono na logística" },
      { label: "Simulador de Acordos", route: "/ferramentas/simulador-acordos-comerciais", desc: "Impacto de acordos nas tarifas" },
    ],
  },
  {
    title: "Serviços Profissionais",
    icon: Shield,
    description: "Consultoria especializada em comércio exterior",
    items: [
      { label: "Auditoria Fiscal", route: "/servicos/auditoria-classificacao-fiscal", desc: "Revisão de classificação NCM" },
      { label: "Despacho Aduaneiro", route: "/servicos/despacho-aduaneiro", desc: "Desembaraço e documentação" },
      { label: "Cotação de Frete", route: "/servicos/cotacao-frete-internacional", desc: "Negociação com transportadoras" },
      { label: "Pesquisa de Mercado", route: "/servicos/pesquisa-mercado-exportacao", desc: "Análise para novos mercados" },
      { label: "Pesquisa Compradores", route: "/servicos/pesquisa-compradores", desc: "Encontre compradores qualificados" },
      { label: "Representação Brasil", route: "/servicos/representacao-brasil", desc: "Representação comercial" },
      { label: "Fulfillment", route: "/servicos/fulfillment", desc: "Logística cross-border completa" },
    ],
  },
];

const ferramentasDestaque = [
  { icon: Search, label: "Classificador NCM", route: "/landing/ncm-classifier", desc: "Classifique produtos com IA" },
  { icon: Calculator, label: "Impostos de Importação", route: "/landing/tariff-calculator", desc: "Calcule todos os tributos" },
  { icon: Ship, label: "Mapa de Frete Marítimo", route: "/landing/maritime-freight-map", desc: "Cotações em tempo real" },
  { icon: Globe, label: "Tarifário Global", route: "/landing/tariff-calculator", desc: "Alíquotas de 31 países" },
  { icon: Users, label: "Diretório Importadores", route: "/landing/importadores", desc: "3.8M+ empresas" },
  { icon: Navigation, label: "Track & Trace", route: "/landing/track-trace", desc: "Navios e aviões ao vivo" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function FerramentasPage() {
  useSeo({
    title: "Ferramentas de Comércio Exterior — TRADEXA",
    description: "Todas as ferramentas da TRADEXA: classificação NCM, tarifas globais, rastreamento de cargas, inteligência de mercado, calculadoras e serviços profissionais.",
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Package className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Ferramentas e Serviços</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Tudo para seu <span className="text-[#D80E16]">Comércio Exterior</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Mais de 35 ferramentas e serviços para classificação, tarifas, rastreamento, inteligência de mercado e consultoria especializada.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Destaques */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D80E16]" /> Mais acessados
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ferramentasDestaque.map((f) => (
              <Link key={f.route} to={f.route}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/50 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-[#D80E16]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#D80E16] transition-colors">{f.label}</h3>
                  <p className="text-xs text-slate-400 truncate">{f.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D80E16] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Categorias */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D80E16]" /> Todas as categorias
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
            {categories.map((cat) => (
              <motion.div key={cat.title} variants={item}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-[#D80E16]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{cat.title}</h2>
                    <p className="text-sm text-slate-400">{cat.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 ml-[52px]">
                  {cat.items.map((it) => (
                    <Link key={it.route} to={it.route}
                      className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 hover:shadow-md transition-all group">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#D80E16] transition-colors flex items-center gap-2">
                          {it.label}
                          {it.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D80E16]/10 text-[#D80E16]">{it.badge}</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{it.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D80E16] transition-colors shrink-0 ml-3" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">
              Precisa de ajuda <span className="text-[#D80E16]">personalizada</span>?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Nossa equipe pode ajudar com classificação NCM, cálculo de custos e estratégia de comércio exterior.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
                Começar Grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contato" className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors">
                Falar com Vendas
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
