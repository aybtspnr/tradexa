/**
 * Página índice de serviços comerciais — lista todos os serviços com cards.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Ship, Shield, Package, Globe, FileSearch,
  ArrowRight, Sparkles, CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const servicos = [
  {
    slug: "pesquisa-mercado-exportacao",
    title: "Pesquisa de Mercado para Exportação",
    desc: "Identificamos os mercados mais promissores para seus produtos com dados reais de comércio exterior.",
    icon: BarChart3,
    color: "#D80E16",
    features: ["Análise de potencial por país", "Benchmark de preços", "Concorrência local", "Canais de distribuição"],
  },
  {
    slug: "pesquisa-compradores",
    title: "Pesquisa de Compradores Internacionais",
    desc: "Encontramos compradores qualificados no exterior usando dados reais de importação.",
    icon: Users,
    color: "#2563eb",
    features: ["Leads qualificados", "Histórico de importação", "Contatos verificados", "Template de abordagem"],
  },
  {
    slug: "cotacao-frete-internacional",
    title: "Cotação de Frete Internacional",
    desc: "Comparamos cotações com 20+ armadores e agentes. Marítimo, aéreo e rodoviário.",
    icon: Ship,
    color: "#0ea5e9",
    features: ["3-5 cotações por rota", "Comparativo all-in", "Tracking em tempo real", "Suporte documental"],
  },
  {
    slug: "despacho-aduaneiro",
    title: "Despacho Aduaneiro",
    desc: "Assessoria completa em importação e exportação. Despachantes em todos os portos do Brasil.",
    icon: Shield,
    color: "#10b981",
    features: ["Cobertura nacional", "Classificação NCM", "Licenciamento", "Despacho no destino"],
  },
  {
    slug: "fulfillment",
    title: "Fulfillment Internacional",
    desc: "Armazenagem, picking, packing e distribuição B2B/B2C no Brasil e exterior.",
    icon: Package,
    color: "#f59e0b",
    features: ["Centros em SP, SC e Miami", "Integração e-commerce", "Preparação FBA", "Logística reversa"],
  },
  {
    slug: "representacao-brasil",
    title: "Representação Comercial no Brasil",
    desc: "Seu braço comercial no Brasil. Prospecção, relacionamento e suporte operacional.",
    icon: Globe,
    color: "#8b5cf6",
    features: ["Prospecção ativa", "Feiras e eventos", "Gestão de pipeline", "Suporte operacional"],
  },
  {
    slug: "auditoria-classificacao-fiscal",
    title: "Auditoria de Classificação Fiscal",
    desc: "Revisão completa dos seus NCMs para reduzir impostos legalmente e eliminar riscos de autuação.",
    icon: FileSearch,
    color: "#059669",
    features: ["Economia de impostos", "Ex-tarifários", "Análise de risco", "Relatório executivo"],
  },
  {
    slug: "agenciamento-carga",
    title: "Frete Internacional Gerenciado",
    desc: "Agenciamento de carga completo: cotação, reserva, tracking ao vivo, documentação e desembaraço integrados.",
    icon: Ship,
    color: "#D80E16",
    features: ["Cotação 20+ armadores", "Tracking ao vivo no mapa", "Documentação completa", "Despacho integrado"],
  },
];

export default function ServicosIndexPage() {
  useSeo({
    title: "Serviços para Exportadores e Importadores | TRADEXA",
    description: "Pesquisa de mercado, compradores, cotação de frete, despacho aduaneiro, fulfillment e representação no Brasil.",
    canonical: "https://www.tradexa.com.br/servicos",
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Serviços
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Tudo que seu <span className="text-[#D80E16]">comércio exterior</span> precisa
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Da pesquisa de mercado à entrega ao cliente final. Serviços completos para
              exportadores e importadores, com especialistas que falam a sua língua.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <Link
                    to={`/servicos/${s.slug}`}
                    className="group block relative h-full rounded-2xl border border-black/[0.06] bg-white p-6
                      hover:shadow-[0_8px_40px_-12px_rgba(15,17,26,0.15)] hover:border-[#D80E16]/15
                      transition-all duration-500 overflow-hidden"
                  >
                    {/* Glass hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.8),transparent_60%)]" />

                    {/* Colored gradient accent */}
                    <div
                      className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                      style={{ background: `radial-gradient(circle, ${s.color}, transparent 70%)` }}
                    />

                    <div className="relative z-10">
                      {/* Icon with glow */}
                      <div className="relative mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-0
                            group-hover:scale-105 group-hover:shadow-md transition-all duration-400"
                          style={{ background: `${s.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: s.color }} />
                        </div>
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
                          style={{ background: s.color }}
                        />
                      </div>

                      <h3 className="font-extrabold text-[#0F111A] mb-2 group-hover:text-[#D80E16] transition-colors duration-300">
                        {s.title}
                      </h3>
                      <p className="text-sm text-[#5E6278] leading-relaxed mb-4">
                        {s.desc}
                      </p>
                      <div className="space-y-1.5 mb-4">
                        {s.features.map((f, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-[#5E6278]">
                            <CheckCircle className="w-3 h-3 text-[#10b981] shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D80E16]
                        group-hover:gap-2.5 transition-all duration-300">
                        Saiba mais <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Não encontrou o que precisa?
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">
              Serviço sob medida
            </h2>
            <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
              Precisa de algo mais específico? Nossa equipe monta soluções personalizadas
              combinando múltiplos serviços para atender exatamente sua operação.
            </p>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              Falar com Especialista
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
