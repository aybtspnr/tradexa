import { Link } from "react-router-dom";
import {
  Calculator, FileText, Shield, TrendingUp, PiggyBank, Anchor,
  Leaf, Handshake, ArrowRight, Sparkles, Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const categorias = [
  {
    titulo: "Calculadoras Financeiras",
    icon: Calculator,
    desc: "Simule custos, tributos e margens da sua operação",
    ferramentas: [
      {
        icon: FileText, label: "Calculadora de Incoterms",
        route: "/ferramentas/calculadora-incoterms",
        landing: "/landing/calculadora-incoterms",
        desc: "Compare os 11 Incoterms 2020: EXW, FOB, CIF, DDP",
        cor: "#8b5cf6",
      },
      {
        icon: TrendingUp, label: "Precificação de Exportação",
        route: "/ferramentas/precificacao-exportacao",
        landing: "/landing/precificacao-exportacao",
        desc: "Calcule o preço final no mercado de destino",
        cor: "#10b981",
      },
      {
        icon: PiggyBank, label: "Calculadora de Drawback",
        route: "/ferramentas/calculadora-drawback",
        landing: "/landing/calculadora-drawback",
        desc: "Simule a suspensão de tributos na exportação",
        cor: "#D80E16",
      },
      {
        icon: TrendingUp, label: "Calculadora ACC/ACE",
        route: "/ferramentas/calculadora-acc-ace",
        landing: "/landing/calculadora-acc-ace",
        desc: "Financiamento à exportação: antecipe recebíveis",
        cor: "#f59e0b",
      },
      {
        icon: Leaf, label: "Calculadora de Carbono",
        route: "/ferramentas/calculadora-carbono",
        landing: "/landing/calculadora-carbono",
        desc: "Pegada de carbono na logística internacional",
        cor: "#10b981",
      },
    ],
  },
  {
    titulo: "Documentos e Conformidade",
    icon: Shield,
    desc: "Garanta que sua operação esteja em conformidade",
    ferramentas: [
      {
        icon: FileText, label: "Gerador de Documentos",
        route: "/ferramentas/gerador-documentos",
        landing: "/landing/gerador-documentos",
        desc: "DI, LI e documentos aduaneiros em PDF",
        cor: "#10b981",
      },
      {
        icon: Shield, label: "Conformidade Regulatória",
        route: "/ferramentas/conformidade-regulatoria",
        landing: "/landing/conformidade-regulatoria",
        desc: "ANVISA, INMETRO, MAPA e órgãos reguladores",
        cor: "#D80E16",
      },
    ],
  },
  {
    titulo: "Comparação e Simulação",
    icon: Handshake,
    desc: "Compare portos, acordos e cenários comerciais",
    ferramentas: [
      {
        icon: Anchor, label: "Comparador de Portos",
        route: "/ferramentas/comparador-portos",
        landing: "/landing/comparador-portos",
        desc: "Compare custos e eficiência entre portos brasileiros",
        cor: "#3b82f6",
      },
      {
        icon: Handshake, label: "Simulador de Acordos Comerciais",
        route: "/ferramentas/simulador-acordos-comerciais",
        landing: "/landing/simulador-acordos-comerciais",
        desc: "Impacto de acordos Mercosul, ALADI e SGP nas tarifas",
        cor: "#8b5cf6",
      },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FerramentasIndexPage() {
  useSeo({
    title: "Ferramentas de Comércio Exterior — Calculadoras",
    description: "Calculadoras de Incoterms, Drawback, ACC/ACE, Precificação, Carbono, Documentos e Conformidade. Ferramentas gratuitas para comércio exterior.",
    url: "https://www.tradexa.com.br/ferramentas",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Ferramentas de Comércio Exterior — TRADEXA",
      description: "Calculadoras e simuladores para importação e exportação.",
      url: "https://www.tradexa.com.br/ferramentas",
    },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={100} />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Wrench className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Ferramentas Gratuitas</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Ferramentas de{" "}
                <span className="text-[#D80E16]">Comércio Exterior</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Calculadoras, geradores de documentos e simuladores para sua
                operação de importação e exportação. Todas gratuitas.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Todas as Ferramentas (destaque) */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D80E16]" /> Acesso Rápido
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {categorias.flatMap((cat) => cat.ferramentas).map((f) => (
              <Link
                key={f.route}
                to={f.landing}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${f.cor}15`, border: `1px solid ${f.cor}30` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#D80E16] transition-colors">
                    {f.label}
                  </h3>
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
            {categorias.map((cat) => (
              <motion.div key={cat.titulo} variants={itemAnim}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-[#D80E16]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{cat.titulo}</h2>
                    <p className="text-sm text-slate-400">{cat.desc}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 ml-[52px]">
                  {cat.ferramentas.map((f) => (
                    <Link
                      key={f.route}
                      to={f.landing}
                      className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${f.cor}12` }}
                        >
                          <f.icon className="w-4 h-4" style={{ color: f.cor }} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#D80E16] transition-colors">
                            {f.label}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">{f.desc}</p>
                        </div>
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
              Precisa de ferramentas <span className="text-[#D80E16]">profissionais</span>?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Além das ferramentas gratuitas, a TRADEXA oferece dashboards
              profissionais com dados reais de comércio exterior, inteligência
              de mercado e análises avançadas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors"
              >
                Criar Conta Grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/recursos"
                className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Ver Recursos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
