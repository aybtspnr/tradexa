import { Link } from "react-router-dom";
import { Ship, ArrowRight, TrendingUp, TrendingDown, Calendar, Anchor } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const meses = [
  { mes: "Jan 2025", wci: 1842, variacao: "-3%", tendencia: "down", nota: "Estabilização pós-altas" },
  { mes: "Fev 2025", wci: 1798, variacao: "-2%", tendencia: "down", nota: "Baixa sazonalidade" },
  { mes: "Mar 2025", wci: 1856, variacao: "+3%", tendencia: "up", nota: "Retomada pré-peak season" },
  { mes: "Abr 2025", wci: 1924, variacao: "+4%", tendencia: "up", nota: "Aumento da demanda asiática" },
  { mes: "Mai 2025", wci: 2012, variacao: "+5%", tendencia: "up", nota: "Início da alta temporada" },
  { mes: "Jun 2025", wci: 2187, variacao: "+9%", tendencia: "up", nota: "Pico de demanda" },
  { mes: "Jul 2025", wci: 2045, variacao: "-7%", tendencia: "down", nota: "Correção pós-pico" },
  { mes: "Ago 2025", wci: 1978, variacao: "-3%", tendencia: "down", note: "Normalização" },
  { mes: "Set 2025", wci: 2034, variacao: "+3%", tendencia: "up", nota: "Pré-Black Friday" },
  { mes: "Out 2025", wci: 2156, variacao: "+6%", tendencia: "up", nota: "Alta temporada exportação" },
  { mes: "Nov 2025", wci: 2289, variacao: "+6%", tendencia: "up", nota: "Pico sazonal" },
  { mes: "Dez 2025", wci: 2198, variacao: "-4%", tendencia: "down", nota: "Fim de ano, queda parcial" },
];

export default function RelatorioEvolucaoWciPage() {
  useSeo({
    title: "Evolução do WCI: Frete Marítimo em 12 Meses | TRADEXA",
    description: "Análise da evolução do World Container Index (WCI) nos últimos 12 meses. Tendências, altas sazonais e impactos no comércio exterior brasileiro.",
    url: "https://www.tradexa.com.br/relatorio/evolucao-wci",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Report", name: "Evolução do WCI em 12 Meses", author: { "@type": "Organization", name: "TRADEXA" }, datePublished: "2026-05-27" },
  });

  const wciMedio = Math.round(meses.reduce((a, m) => a + m.wci, 0) / meses.length);
  const wciMax = Math.max(...meses.map(m => m.wci));
  const wciMin = Math.min(...meses.map(m => m.wci));

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Anchor className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Relatório 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Evolução do <span className="text-[#D80E16]">WCI</span> em 12 Meses
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mb-6">
                Acompanhe a evolução do World Container Index e entenda como os custos de frete impactam o comércio exterior brasileiro.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" /><span>Dados: Janeiro–Dezembro 2025 | Fonte: Drewry WCI</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { label: "Média Anual", value: `US$ ${wciMedio.toLocaleString()}`, icon: Ship, color: "text-blue-400" },
              { label: "Pico", value: `US$ ${wciMax.toLocaleString()}`, icon: TrendingUp, color: "text-red-400" },
              { label: "Mínima", value: `US$ ${wciMin.toLocaleString()}`, icon: TrendingDown, color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {meses.map((m, i) => (
              <motion.div key={m.mes} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors">
                <div className="w-20 text-sm text-slate-500 font-mono shrink-0">{m.mes}</div>
                <div className="flex-1">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D80E16] rounded-full transition-all" style={{ width: `${((m.wci - 1500) / 1000) * 100}%` }} />
                  </div>
                </div>
                <div className="w-24 text-right font-bold text-slate-800 text-sm shrink-0">US$ {m.wci.toLocaleString()}</div>
                <div className={`w-16 text-right text-sm font-bold shrink-0 ${m.variacao.startsWith("+") ? "text-red-400" : "text-green-400"}`}>
                  {m.variacao}
                </div>
                <div className="w-48 text-xs text-slate-400 shrink-0 hidden md:block">{m.nota}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Análise de Tendência</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p>O WCI apresentou volatildade moderada em 2025, com <strong className="text-slate-800 font-semibold">picos sazonais em junho e novembro</strong> ligados à demanda por containers.</p>
              <p>A <strong className="text-slate-800 font-semibold">média anual de US$ {wciMedio.toLocaleString()}</strong> está acima do patamar pré-pandemia (US$ 1.400-1.600), indicando uma nova normalidade de fretes.</p>
              <p>Para importadores brasileiros, isso significa que o custo de frete marítimo representa entre <strong className="text-slate-800 font-semibold">8% e 15%</strong> do custo CIF total, dependendo da rota e do tipo de carga.</p>
            </div>
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Cote seu frete agora</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use o Mapa de Frete Marítimo da TRADEXA com preços atualizados baseados no WCI.</p>
            <Link to="/maritime-freight-map" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Ver Mapa de Frete <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
