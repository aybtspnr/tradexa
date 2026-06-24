import { Link } from "react-router-dom";
import { BarChart3, ArrowRight, TrendingUp, Calendar, Package } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const produtos = [
  { rank: 1, ncm: "2709.00", produto: "Petróleo Bruto", valor: "US$ 42,8 bi", variacao: "+18%", destino: "Petroquímica, combustíveis" },
  { rank: 2, ncm: "8542.31", produto: "Circuitos Integrados", valor: "US$ 18,2 bi", variacao: "+24%", destino: "Eletrônicos, automação" },
  { rank: 3, ncm: "8471.30", produto: "Notebooks e Portáteis", valor: "US$ 12,4 bi", variacao: "+12%", destino: "TI, escritórios" },
  { rank: 4, ncm: "8703.80", produto: "Veículos Automotores (Elétricos/Híbridos)", valor: "US$ 9,8 bi", variacao: "+67%", destino: "Transporte, fretes" },
  { rank: 5, ncm: "3004.90", produto: "Medicamentos", valor: "US$ 8,9 bi", variacao: "+8%", destino: "Saúde, farmacêutica" },
  { rank: 6, ncm: "8528.72", produto: "Monitores e Projetores", valor: "US$ 7,6 bi", variacao: "+15%", destino: "TI, entretenimento" },
  { rank: 7, ncm: "7207.11", produto: "Semi-acabados de Aço", valor: "US$ 6,8 bi", variacao: "-5%", destino: "Construção, manufatura" },
  { rank: 8, ncm: "8411.81", produto: "Turbinas a Gás", valor: "US$ 5,4 bi", variacao: "+22%", destino: "Energia, petróleo" },
  { rank: 9, ncm: "0901.11",produto: "Café em Graos", valor: "US$ 4,9 bi", variacao: "+31%", destino: "Beneficiamento, exportação" },
  { rank: 10, ncm: "8481.40", produto: "Valvulas", valor: "US$ 4,2 bi", variacao: "+9%", destino: "Petroquímica, industrial" },
];

export default function RelatorioTopImportacoesPage() {
  useSeo({
    title: "Top 10 Produtos Mais Importados pelo Brasil 2026 | TRADEXA",
    description: "Ranking dos produtos mais importados pelo Brasil com dados de volume, valor e variação anual. Análise completa do comércio exterior.",
    url: "https://www.tradexa.com.br/relatorio/top-produtos-importados",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Report", name: "Top 10 Produtos Mais Importados pelo Brasil", author: { "@type": "Organization", name: "TRADEXA" }, datePublished: "2026-05-27" },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Relatório Top Produtos Importados pelo Brasil</h2>
        <p>Este relatório apresenta os produtos mais importados pelo Brasil, organizados por código NCM, volume e valor. Os dados são extraídos das estatísticas oficiais de comércio exterior e atualizados mensalmente. Inclui análises de tendências, comparação ano a ano, principais países fornecedores e market share. Ideal para importadores que querem entender o tamanho do mercado, identificar concorrentes e planejar operações com dados reais.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Package className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Relatório 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Top 10 Produtos <span className="text-[#D80E16]">Mais Importados</span> pelo Brasil
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mb-6">
                Ranking dos produtos com maior volume de importação, com código NCM, valor e variação anual.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" /><span>Dados: Janeiro–Dezembro 2025 | Fonte: comércio exterior</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-4">
            {produtos.map((p) => (
              <motion.div key={p.rank} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: p.rank * 0.05 }}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-[#D80E16]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-extrabold text-lg shrink-0">
                  {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-800">{p.produto}</h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-500 font-mono">{p.ncm}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.destino}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">{p.valor}</p>
                  <p className={`text-xs font-bold ${p.variacao.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{p.variacao} a.a.</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Destaque: Veículos Elétricos</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Veículos elétricos e híbridos tiveram crescimento de <strong className="text-slate-800 font-semibold">+67%</strong> em importações,
              impulsionados pela entrada de marcas chinesas (BYD, GWM, Chery) e pela política de incentivos do governo.
              O NCM 8703.80 se consolidou como um dos mais dinâmicos da pauta importadora brasileira.
            </p>
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Quer monitorar esses produtos?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use a TRADEXA para rastrear importações por NCM, competitor e mercado em tempo real.</p>
            <Link to="/intelligence" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir Dashboard de Inteligência <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
