import { Link } from "react-router-dom";
import { BarChart3, Download, ArrowRight, TrendingUp, Globe, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const estados = [
  { rank: 1, uf: "SP", nome: "São Paulo", exportacao: "US$ 48,2 bi", share: "28,7%", top: "Petróleo refinificado, automóveis, aviões" },
  { rank: 2, uf: "RJ", nome: "Rio de Janeiro", exportacao: "US$ 22,1 bi", share: "13,2%", top: "Petróleo bruto, minério de ferro, aço" },
  { rank: 3, uf: "MG", nome: "Minas Gerais", exportacao: "US$ 19,8 bi", share: "11,8%", top: "Minério de ferro, soja, ferro e aço" },
  { rank: 4, uf: "RS", nome: "Rio Grande do Sul", exportacao: "US$ 12,4 bi", share: "7,4%", top: "Soja, couro, fumos, arroz" },
  { rank: 5, uf: "PR", nome: "Paraná", exportacao: "US$ 11,9 bi", share: "7,1%", top: "Soja, milho, carne de frango, maquinário" },
  { rank: 6, uf: "SC", nome: "Santa Catarina", exportacao: "US$ 8,7 bi", share: "5,2%", top: "Aves, madeira, máquinas, motores" },
  { rank: 7, uf: "BA", nome: "Bahia", exportacao: "US$ 6,8 bi", share: "4,0%", top: "Petróleo bruto, petroquímicos, celulose" },
  { rank: 8, uf: "ES", nome: "Espírito Santo", exportacao: "US$ 5,2 bi", share: "3,1%", top: "Minério de ferro, aço, café" },
  { rank: 9, uf: "GO", nome: "Goiás", exportacao: "US$ 4,8 bi", share: "2,9%", top: "Soja, algodão, carne bovina" },
  { rank: 10, uf: "MT", nome: "Mato Grosso", exportacao: "US$ 4,5 bi", share: "2,7%", top: "Soja, algodão, couro bovino" },
];

export default function RelatorioEstadosExportacaoPage() {
  useSeo({
    title: "Ranking: Estados que Mais Exportam do Brasil 2026 | TRADEXA",
    description: "Análise completa dos estados brasileiros que mais exportam. Ranking com dados de volume, principais produtos e destinos de exportação.",
    url: "https://www.tradexa.com.br/relatorio/estados-que-mais-exportam",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Report", name: "Ranking dos Estados que Mais Exportam", author: { "@type": "Organization", name: "TRADEXA" }, datePublished: "2026-05-27" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <BarChart3 className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Relatório 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Estados que <span className="text-[#D80E16]">Mais Exportam</span> do Brasil
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mb-6">
                Análise completa do ranking dos estados brasileiros por volume de exportação, com dados de principais produtos e destinos.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" /><span>Dados: Janeiro–Dezembro 2025 | Fonte: comércio exterior / Secex</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6 mb-12">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#D80E16]" /> Resumo Executivo</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Em 2025, o Brasil exportou mais de <strong className="text-slate-800 font-semibold">US$ 339,4 bilhões</strong> em mercadorias, um recorde histórico.
              Os 10 estados listados representam aproximadamente <strong className="text-slate-800 font-semibold">86,1%</strong> do total de exportações brasileiras.
              São Paulo lidera com quase 29% do total, impulsionado por petróleo refinificado, aviões da Embraer e veículos automotores.
            </p>
          </div>

          <div className="space-y-4">
            {estados.map((e) => (
              <motion.div key={e.uf} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: e.rank * 0.05 }}
                className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-[#D80E16]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-extrabold text-lg shrink-0">
                  {e.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-800">{e.nome}</h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-500">{e.uf}</span>
                  </div>
                  <p className="text-xs text-slate-400">{e.top}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">{e.exportacao}</p>
                  <p className="text-xs text-[#D80E16]">{e.share} do total</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Insights para Exportadores</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p>• <strong className="text-slate-800 font-semibold">São Paulo</strong> domina em valor agregado (aviões, petroquímicos, autopeças) — ideal para empresas de tecnologia e manufatura</p>
              <p>• <strong className="text-slate-800 font-semibold">PR e GO</strong> lideram em commodities agrícolas — oportunidades para insumos agrícolas e equipamentos</p>
              <p>• <strong className="text-slate-800 font-semibold">SC</strong> tem a maior densidade de empresas exportadoras per capita — ecossistema forte de PMEs</p>
              <p>• <strong className="text-slate-800 font-semibold">MT e GO</strong> são os estados com maior crescimento — fronteira agrícola em expansão</p>
            </div>
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Quer analisar seu estado?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use o Trade Intelligence da TRADEXA para analisar exportações por estado, produto e destino.</p>
            <Link to="/trade-intelligence" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir Trade Intelligence <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
