import { Link } from "react-router-dom";
import {
  Calendar, Clock, ArrowRight, TrendingUp, CheckCircle, Zap,
  Globe, BarChart3, Ship, Sparkles, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";

// ─── Dados de visualização ───
const balancaData = [
  { mes: "Jan", exportacao: 22.5, importacao: 19.8 },
  { mes: "Fev", exportacao: 20.1, importacao: 18.5 },
  { mes: "Mar", exportacao: 24.3, importacao: 21.2 },
  { mes: "Abr", exportacao: 25.1, importacao: 22.8 },
  { mes: "Mai", exportacao: 26.8, importacao: 23.5 },
  { mes: "Jun", exportacao: 27.2, importacao: 24.1 },
];

const setoresCrescimento = [
  { setor: "Veículos Elétricos", crescimento: 67, cor: "#D80E16" },
  { setor: "Serviços Digitais", crescimento: 32, cor: "#f59e0b" },
  { setor: "Energia Renovável", crescimento: 28, cor: "#10b981" },
  { setor: "Intra-Mercosul", crescimento: 15, cor: "#8b5cf6" },
  { setor: "Agronegócio", crescimento: 12, cor: "#06b6d4" },
];

// ─── Timeline Card ───
function TimelineCard({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F111A]">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 items-start bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
            <p className="text-sm text-[#5E6278] leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Stat Card ───
function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  color: string;
}) {
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
        {trend && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] bg-[#10b981]/[0.08] px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-[#5E6278] mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#0F111A]">{value}</p>
    </motion.div>
  );
}

// ─── Main Page ───
export default function OQueMudouComex2026Page() {
  useSeo({
    title: "O que Mudou no Comércio Exterior em 2026 | TRADEXA",
    description:
      "Resumo das principais mudanças no comércio exterior brasileiro em 2026: novas regras, alíquotas, acordos e tendências.",
    canonical: "https://www.tradexa.com.br/blog/o-que-mudou-comex-2026",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "O que Mudou no Comércio Exterior em 2026",
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
              <Zap className="w-4 h-4 text-[#D80E16]" />
              <span className="text-sm text-[#D80E16] font-bold">Tendências 2026</span>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#5E6278] hover:text-[#D80E16] transition-colors mb-6"
            >
              ← Voltar para o blog
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              O que Mudou no{" "}
              <span className="text-[#D80E16]">Comex</span> em 2026
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mb-6">
              Principais mudanças regulatórias, acordos comerciais e tendências do
              comércio exterior brasileiro que impactam importadores e exportadores.
            </p>
            <div className="flex items-center gap-3 text-sm text-[#5E6278] flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Atualizado: Maio 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                8 min de leitura
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
            <StatCard label="Balança Comercial (2026)" value="+US$ 15,2 Bi" trend="+8.3%" icon={BarChart3} color="#D80E16" />
            <StatCard label="Exportações" value="US$ 168 Bi" trend="+5.7%" icon={TrendingUp} color="#10b981" />
            <StatCard label="Importações" value="US$ 152 Bi" trend="+3.1%" icon={Ship} color="#f59e0b" />
            <StatCard label="Corrente de Comércio" value="US$ 320 Bi" trend="+4.5%" icon={Globe} color="#8b5cf6" />
          </motion.div>

          {/* Balança Comercial Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#D80E16]" />
              Balança Comercial — 2026
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balancaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#5E6278" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#5E6278" }} unit=" Bi" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="exportacao" name="Exportação" fill="#D80E16" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="importacao" name="Importação" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Growth Sectors Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
              Setores em Expansão (% a.a.)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setoresCrescimento} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#5E6278" }} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="setor"
                    tick={{ fontSize: 12, fill: "#5E6278" }}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                    formatter={(v: number) => [`+${v}% a.a.`, "Crescimento"]}
                  />
                  <Bar dataKey="crescimento" radius={[0, 6, 6, 0]}>
                    {setoresCrescimento.map((entry, i) => (
                      <rect key={i} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Mudanças Regulatórias */}
          <TimelineCard
            icon={CheckCircle}
            title="Mudanças Regulatórias"
            color="#D80E16"
            items={[
              "Atualização da tabela NCM — novos códigos para produtos de tecnologia e sustentabilidade",
              "Aumento da isenção de II para equipamentos de energia renovável",
              "Novas regras de remessa conforme — ampliação do limite para US$ 50",
              "Digitalização do processo aduaneiro — novas funcionalidades no Único Siscomex",
            ]}
          />

          {/* Acordos Comerciais */}
          <TimelineCard
            icon={Globe}
            title="Acordos Comerciais"
            color="#2563eb"
            items={[
              "Mercosul-União Europeia — entrada em fase de implementação",
              "Mercosul-Singapura — preferências tarifárias ampliadas",
              "ACE-35 — ampliação do arco de produtos com tarifa zero",
              "Renegociação do ACE-14 com Chile — novos itens incluídos",
            ]}
          />

          {/* Tendências */}
          <TimelineCard
            icon={TrendingUp}
            title="Tendências de Mercado"
            color="#10b981"
            items={[
              "Crescimento de veículos elétricos nas importações (+67% a.a.)",
              "Expansão da exportação de serviços digitais (+32% a.a.)",
              "Aumento do comércio intra-Mercosul (+15% a.a.)",
              "Sustentabilidade como fator competitivo em exportações",
            ]}
          />

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
                Acompanhe as mudanças em tempo real
              </h3>
              <p className="text-white/80 max-w-lg mx-auto mb-6">
                Use o Trade Intelligence para monitorar dados reais de comércio exterior
                e antecipar tendências.
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
