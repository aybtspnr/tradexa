import { Link } from "react-router-dom";
import { BookOpen, FileText, BarChart3, CheckCircle, ArrowRight, Sparkles, Ship, Globe, TrendingUp, Search, Calculator, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const categories = [
  {
    title: "Glossário",
    icon: BookOpen,
    description: "60+ termos essenciais do comércio exterior explicados",
    items: [
      { label: "Glossário COMEX", route: "/glossario", desc: "NCM, HS Code, drawback, OEA e mais" },
    ],
  },
  {
    title: "Guias Completos",
    icon: FileText,
    description: "Páginas-âncora com tudo sobre um tema",
    items: [
      { label: "Guia Completo de Importação", route: "/guia-importacao", desc: "Processo, documentos, impostos, regimes" },
      { label: "Guia Completo de Exportação", route: "/guia-exportacao", desc: "Incentivos, mercados, dicas" },
      { label: "Tudo sobre NCM", route: "/guia-ncm", desc: "Classificação, consulta, uso" },
      { label: "Logística Internacional", route: "/logistica-internacional", desc: "Frete, portos, containeres, WCI" },
    ],
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    description: "Análises com dados reais de comércio exterior",
    items: [
      { label: "Estados que Mais Exportam", route: "/relatorio/estados-que-mais-exportam", desc: "Ranking com volume e produtos" },
      { label: "Top Produtos Importados", route: "/relatorio/top-produtos-importados", desc: "NCMs, valores e variações" },
      { label: "Evolução do WCI", route: "/relatorio/evolucao-wci", desc: "Frete marítimo em 12 meses" },
    ],
  },
  {
    title: "Checklists e Templates",
    icon: CheckCircle,
    description: "Listas prontas para usar no dia a dia",
    items: [
      { label: "25 Documentos para Importar da China", route: "/checklist/importar-china", desc: "Checklist completo" },
      { label: "Como Abrir Empresa de Comex", route: "/checklist/empresa-comercio-exterior", desc: "Do CNPJ à primeira operação" },
      { label: "Certificações Obrigatórias", route: "/checklist/certificacoes-importacao", desc: "ANVISA, INMETRO, IBAMA, MAPA" },
      { label: "Planilha de Cálculo CIF", route: "/template/planilha-cif", desc: "Modelo de cálculo completo" },
      { label: "8 Erros Fatais na Importação", route: "/checklist/erros-importacao", desc: "Erros que custam caro" },
    ],
  },
  {
    title: "Tutoriais",
    icon: Sparkles,
    description: "Como usar as ferramentas da TRADEXA",
    items: [
      { label: "Classificador NCM com IA", route: "/tutorial/classificador-ncm", desc: "Classifique em segundos" },
      { label: "Monitorar Preços de Frete", route: "/tutorial/monitorar-wci", desc: "Acompanhe o WCI" },
      { label: "Analisar Concorrentes", route: "/tutorial/trade-intelligence", desc: "Dados de comércio exterior" },
      { label: "Encontrar Importadores", route: "/tutorial/importadores", desc: "Prospecção de clientes" },
      { label: "Calcular Impostos", route: "/tutorial/calculadora-importacao", desc: "II, IPI, PIS, COFINS, ICMS" },
    ],
  },
  {
    title: "Tendências",
    icon: TrendingUp,
    description: "Análises de mercado e previsões",
    items: [
      { label: "Impacto Tarifas Trump", route: "/blog/impacto-tarifas-trump-exportacoes", desc: "Setores afetados e estratégias" },
      { label: "O que Mudou no Comex 2026", route: "/blog/o-que-mudou-comex-2026", desc: "Mudanças regulatórias e acordos" },
      { label: "Previsão Comex Q3 2026", route: "/blog/previsao-comex-q3-2026", desc: "Tendências e oportunidades" },
    ],
  },
];

const ferramentas = [
  { icon: Search, label: "Classificador NCM", route: "/landing/ncm-classifier", desc: "Classifique produtos com IA" },
  { icon: Calculator, label: "Calculadora de Importação", route: "/landing/calculadora-importacao", desc: "Calcule todos os impostos" },
  { icon: Ship, label: "Mapa de Frete Marítimo", route: "/maritime-freight-map", desc: "Preços em tempo real" },
  { icon: Globe, label: "Tarifas Globais", route: "/landing/tariff-calculator", desc: "Alíquotas de 31 países" },
  { icon: Users, label: "Importadores", route: "/landing/importadores", desc: "Diretório de empresas" },
  { icon: TrendingUp, label: "Trade Intelligence", route: "/landing/import-dashboard", desc: "Análise de mercado" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function RecursosPage() {
  useSeo({
    title: "Recursos — Glossário, Guias e Tutoriais",
    description: "Central de recursos da TRADEXA: glossário COMEX, guias completos, relatórios com dados reais, checklists, tutoriais e tendências de comércio exterior.",
    url: "https://www.tradexa.com.br/recursos",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Recursos de Comércio Exterior — TRADEXA",
      description: "Glossário, guias, relatórios, checklists e tutoriais sobre comércio exterior.",
      url: "https://www.tradexa.com.br/recursos",
    },
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
                <BookOpen className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Central de Recursos</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Tudo sobre <span className="text-[#D80E16]">Comércio Exterior</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Glossário, guias completos, relatórios com dados reais, checklists práticos, tutoriais e tendências de mercado.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Ferramentas Rápidas */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D80E16]" /> Ferramentas
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {ferramentas.map((f) => (
              <Link key={f.route} to={f.route}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/50 transition-colors group">
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
                      className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors group">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#D80E16] transition-colors">{it.label}</h4>
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

        {/* Blog */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D80E16]" /> Blog
            </h2>
            <Link to="/blog" className="text-sm text-[#D80E16] hover:text-[#b80c12] transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-6">60+ artigos sobre importação, exportação, NCM, frete, impostos e inteligência comercial.</p>
          <Link to="/blog"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-4 hover:border-[#D80E16]/50 transition-colors group">
            <FileText className="w-5 h-5 text-[#D80E16]" />
            <span className="font-bold text-slate-800 group-hover:text-[#D80E16] transition-colors">Acessar o Blog</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D80E16] transition-colors" />
          </Link>
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
              <Link to="/contact" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
                Falar com Equipe <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors">
                Ver Serviços
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
