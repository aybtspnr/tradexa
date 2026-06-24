import { Link } from "react-router-dom";
import {
  Globe, ArrowRight, TrendingUp, AlertTriangle, Calendar,
  Clock, BarChart3, Sparkles, Ship, CheckCircle, DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";

// ─── Dados ───
const tarifasPorSetor = [
  { setor: "Aço", tarifa: 25, exportacao: 6.8, fill: "#ef4444" },
  { setor: "Alumínio", tarifa: 25, exportacao: 2.1, fill: "#f97316" },
  { setor: "Automotivo", tarifa: 25, exportacao: 4.3, fill: "#f59e0b" },
  { setor: "Agronegócio", tarifa: 15, exportacao: 12.5, fill: "#84cc16" },
  { setor: "Têxteis", tarifa: 20, exportacao: 1.8, fill: "#06b6d4" },
  { setor: "Petróleo", tarifa: 0, exportacao: 8.2, fill: "#10b981" },
];

const impactoPorEstado = [
  { estado: "SP", exportacao: 12.4, risco: "Alto" },
  { estado: "MG", exportacao: 5.2, risco: "Alto" },
  { estado: "ES", exportacao: 3.8, risco: "Alto" },
  { estado: "RS", exportacao: 4.1, risco: "Médio" },
  { estado: "PR", exportacao: 3.2, risco: "Médio" },
  { estado: "BA", exportacao: 2.9, risco: "Baixo" },
];

const riscoCor: Record<string, string> = {
  Alto: "#ef4444",
  Médio: "#f59e0b",
  Baixo: "#10b981",
};

// ─── Stat Card ───
function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}12` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-xs text-[#5E6278] mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#0F111A]">{value}</p>
      {sub && <p className="text-[10px] text-[#5E6278] mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Main Page ───
export default function TarifasTrumpImpactoPage() {
  useSeo({
    title: "Tarifas Trump: Impacto nas Exportações BR 2026 | TRADEXA",
    description:
      "Análise do impacto das novas tarifas americanas sobre as exportações brasileiras. Setores afetados, estratégias e oportunidades.",
    canonical: "https://www.tradexa.com.br/blog/impacto-tarifas-trump-exportacoes",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Impacto das Tarifas Trump nas Exportações Brasileiras 2026",
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
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-bold">Alerta Comercial</span>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#5E6278] hover:text-[#D80E16] transition-colors mb-6"
            >
              ← Voltar para o blog
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Impacto das Tarifas{" "}
              <span className="text-[#D80E16]">Trump</span> nas Exportações
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mb-6">
              Análise completa de como as novas tarifas americanas afetam o comércio
              exterior brasileiro e quais estratégias adotar para mitigar os impactos.
            </p>
            <div className="flex items-center gap-3 text-sm text-[#5E6278] flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Atualizado: Maio 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                10 min de leitura
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
            <StatCard label="Exportação Brasil→EUA (2025)" value="US$ 32,4 Bi" icon={Globe} color="#D80E16" sub="3º parceiro na AL" />
            <StatCard label="Tarifa Média Aplicada" value="10-50%" icon={AlertTriangle} color="#ef4444" sub="Variável por setor" />
            <StatCard label="Setores Críticos" value="3" icon={TrendingUp} color="#f59e0b" sub="Aço, Alumínio, Automotivo" />
            <StatCard label="Setores Isentos" value="Petróleo" icon={CheckCircle} color="#10b981" sub="Acordo bilateral" />
          </motion.div>

          {/* Tarifas por Setor Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#D80E16]" />
              Tarifas por Setor vs. Valor Exportado
            </h2>
            <p className="text-sm text-[#5E6278] mb-6">
              Tarifa adicional aplicada pelos EUA (%) vs valor exportado pelo Brasil (US$ Bi)
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={tarifasPorSetor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="setor" tick={{ fontSize: 12, fill: "#5E6278" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#5E6278" }} unit="%" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#5E6278" }} unit=" Bi" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="tarifa" name="Tarifa (%)" radius={[4, 4, 0, 0]}>
                    {tarifasPorSetor.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="exportacao" name="Exportação (US$ Bi)" fill="#D80E16" radius={[4, 4, 0, 0]} opacity={0.3} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Impacto por Estado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#D80E16]" />
              Impacto por Estado Exportador
            </h2>
            <p className="text-sm text-[#5E6278] mb-6">
              Estados brasileiros com maior exposição às tarifas americanas
            </p>
            <div className="space-y-3">
              {impactoPorEstado.map((item) => (
                <div
                  key={item.estado}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center font-extrabold text-[#0F111A] text-sm shrink-0">
                    {item.estado}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#0F111A]">US$ {item.exportacao} Bi</span>
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{
                          background: `${riscoCor[item.risco]}15`,
                          color: riscoCor[item.risco],
                        }}
                      >
                        Risco {item.risco}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.exportacao / 12.4) * 100}%`,
                          background: riscoCor[item.risco],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Setores Mais Afetados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Setores Mais Afetados
            </h2>
            <div className="space-y-3">
              {[
                { setor: "Aço e Alumínio", impacto: "25% de tarifa adicional", status: "Crítico" },
                { setor: "Automotivo", impacto: "25% sobre veículos e autopeças", status: "Crítico" },
                { setor: "Agronegócio", impacto: "Variável por produto (10-25%)", status: "Moderado" },
                { setor: "Petróleo", impacto: "Isento (acordo bilateral)", status: "Baixo" },
              ].map((s) => (
                <div
                  key={s.setor}
                  className="flex items-center justify-between bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-[#0F111A]">{s.setor}</h4>
                    <p className="text-sm text-[#5E6278]">{s.impacto}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      s.status === "Crítico"
                        ? "bg-red-50 text-red-600"
                        : s.status === "Moderado"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Estratégias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-5 flex items-center gap-2">
              <Ship className="w-5 h-5 text-[#D80E16]" />
              Estratégias de Mitigação
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Diversificar mercados — expandir para Europa, Ásia e Mercosul",
                "Aumentar valor agregado — processar no Brasil antes de exportar",
                "Usar drawback para reduzir custos de insumos importados",
                "Aproveitar acordos comerciais (Mercosul-UE, Mercosul-Singapura)",
                "Monitorar decisões de política comercial em tempo real",
                "Buscar certificações de origem para evitar sobretaxas",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start bg-[#D80E16]/[0.03] border border-[#D80E16]/10 rounded-xl p-4 hover:bg-[#D80E16]/[0.05] transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-[#D80E16] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5E6278] leading-relaxed">{tip}</p>
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
                Monitore o impacto em tempo real
              </h3>
              <p className="text-white/80 max-w-lg mx-auto mb-6">
                Use o Trade Intelligence para acompanhar dados reais do comércio
                bilateral Brasil-EUA e antecipar mudanças.
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
