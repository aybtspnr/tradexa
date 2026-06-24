import { Link } from "react-router-dom";
import {
  Calendar, Clock, ArrowRight, TrendingUp, BarChart3,
  Zap, Globe, Sparkles, AlertTriangle, DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";

// ─── Dados ───
const tendenciaExport = [
  { mes: "Jul", valor: 28.5, prev: 27.8 },
  { mes: "Ago", valor: 29.1, prev: 28.5 },
  { mes: "Set", valor: 28.8, prev: 29.3 },
  { mes: "Out", valor: null, prev: 30.1 },
  { mes: "Nov", valor: null, prev: 29.5 },
  { mes: "Dez", valor: null, prev: 30.8 },
];

const cambioData = [
  { mes: "Jan", brl: 5.45 },
  { mes: "Fev", brl: 5.38 },
  { mes: "Mar", brl: 5.52 },
  { mes: "Abr", brl: 5.48 },
  { mes: "Mai", brl: 5.35 },
  { mes: "Jun", brl: 5.42 },
];

const wciData = [
  { mes: "Jan", wci: 1850 },
  { mes: "Fev", wci: 1920 },
  { mes: "Mar", wci: 2100 },
  { mes: "Abr", wci: 2050 },
  { mes: "Mai", wci: 2150 },
  { mes: "Jun", wci: 2100 },
];

// ─── Stat Card ───
function StatCard({
  label, value, desc, icon: Icon, color, trend,
}: {
  label: string; value: string; desc: string; icon: React.ElementType; color: string; trend: "up" | "down" | "neutral";
}) {
  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingUp : AlertTriangle;
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#f59e0b";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4" style={{ color: trendColor }} />
      </div>
      <p className="text-xs text-[#5E6278] mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#0F111A]">{value}</p>
      <p className="text-xs text-[#5E6278] mt-1">{desc}</p>
    </motion.div>
  );
}

// ─── Main Page ───
export default function PrevisaoComexQ3Page() {
  useSeo({
    title: "Previsão do Comércio Exterior Brasil — Q3 2026 | TRADEXA",
    description:
      "Previsão e análise de tendências para o comércio exterior brasileiro no terceiro trimestre de 2026.",
    canonical: "https://www.tradexa.com.br/blog/previsao-comex-q3-2026",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Previsão do Comércio Exterior Brasil — Q3 2026",
      author: { "@type": "Organization", name: "TRADEXA" },
      datePublished: "2026-05-27",
    },
  });

  return (
    <SiteLayout>
      <ReadingProgressBar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <ParticleCanvasThemed opacity={0.12} particleCount={30} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#D80E16]/8 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
              <BarChart3 className="w-4 h-4 text-[#D80E16]" />
              <span className="text-sm text-[#D80E16] font-bold">Previsão Q3 2026</span>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#5E6278] hover:text-[#D80E16] transition-colors mb-6"
            >
              ← Voltar para o blog
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Previsão do <span className="text-[#D80E16]">Comex</span> — Q3 2026
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mb-6">
              Análise de tendências e projeções para o comércio exterior brasileiro no
              terceiro trimestre de 2026. Oportunidades, riscos e indicadores-chave.
            </p>
            <div className="flex items-center gap-3 text-sm text-[#5E6278] flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Publicado: Maio 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                7 min de leitura
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 bg-[#FAFAF9]">
        <div className="space-y-8">
          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard label="Exportações (proj.)" value="+5-8%" desc="Crescimento moderado, soja e petróleo" icon={TrendingUp} color="#D80E16" trend="up" />
            <StatCard label="Importações (proj.)" value="+2-4%" desc="Estabilidade, alta em tecnologia" icon={Globe} color="#f59e0b" trend="up" />
            <StatCard label="WCI Médio Estimado" value="US$ 2.100" desc="Acima da média histórica" icon={DollarSign} color="#8b5cf6" trend="up" />
            <StatCard label="Câmbio USD/BRL" value="R$ 5,20-5,60" desc="Faixa estimada para o trimestre" icon={AlertTriangle} color="#06b6d4" trend="neutral" />
          </motion.div>

          {/* Exportações — Tendência */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D80E16]" />
              Projeção de Exportações (US$ Bi)
            </h2>
            <p className="text-sm text-[#5E6278] mb-6">
              Linha tracejada: projeção para Q3-Q4 2026
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tendenciaExport}>
                  <defs>
                    <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D80E16" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D80E16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#5E6278" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#5E6278" }} unit=" Bi" domain={[25, 32]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    name="Realizado"
                    stroke="#D80E16"
                    strokeWidth={2}
                    fill="url(#exportGrad)"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="prev"
                    name="Projeção"
                    stroke="#D80E16"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ r: 4, fill: "white", stroke: "#D80E16", strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Câmbio + WCI Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Câmbio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#10b981]" />
                Câmbio USD/BRL
              </h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cambioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5E6278" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#5E6278" }} domain={[5.2, 5.7]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                      formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "USD/BRL"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="brl"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* WCI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#f59e0b]" />
                WCI Container Index
              </h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wciData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5E6278" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#5E6278" }} domain={[1700, 2300]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                      formatter={(v: number) => [`US$ ${v}`, "WCI"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="wci"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Oportunidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#10b981]" />
              Oportunidades para Importadores
            </h2>
            <div className="space-y-3">
              {[
                "Veículos elétricos: mercado em expansão, novas marcas entrando no Brasil",
                "Equipamentos de energia renovável: isenção de II até 2027",
                "Tecnologia 5G e IoT: alta demanda, fornecedores asiáticos competitivos",
              ].map((o, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start bg-emerald-50 border border-emerald-200 rounded-xl p-4 hover:bg-emerald-100 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5E6278] leading-relaxed">{o}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Riscos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Riscos a Monitorar
            </h2>
            <div className="space-y-3">
              {[
                "Instabilidade cambial — câmbio pode variar 10%+ no trimestre",
                "Novas tarifas americanas — possível escalada em setores estratégicos",
                "Oferta de containers — capacidade limitada em rotas Ásia-Brasil",
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5E6278] leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] p-8 md:p-10 text-white overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
            </div>
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
                Acompanhe os indicadores em tempo real
              </h3>
              <p className="text-white/80 max-w-lg mx-auto mb-6">
                Use o Trade Intelligence para monitorar dados de balança comercial,
                câmbio, fretes e tendências de mercado.
              </p>
              <Link
                to="/landing/import-dashboard"
                className="inline-flex items-center gap-2 bg-white text-[#D80E16] hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Abrir Trade Intelligence
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
