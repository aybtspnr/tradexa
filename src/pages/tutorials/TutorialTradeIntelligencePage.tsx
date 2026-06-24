import { Link } from "react-router-dom";
import { Eye, ArrowRight, CheckCircle, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TutorialTradeIntelligencePage() {
  useSeo({
    title: "Como Analisar Concorrentes com Trade Intelligence | Tutorial",
    description: "Tutorial completo: como usar o Trade Intelligence da TRADEXA para descobrir quem importa seu produto e em que volume.",
    url: "https://www.tradexa.com.br/tutorial/trade-intelligence",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Analisar Concorrentes com Trade Intelligence" },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Sobre este tutorial</h2>
        <p>Este tutorial ensina como usar o Trade Intelligence da TRADEXA para analisar dados de comércio exterior. Em 10 minutos você aprende a cruzar dados de importação e exportação brasileira, filtrar por NCM e país, analisar market share, preços médios e tendências de mercado. Ideal para profissionais de inteligência comercial que precisam de dados confiáveis para tomada de decisão estratégica em importação e exportação.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Eye className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Tutorial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Como Analisar <span className="text-[#D80E16]">Concorrentes</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Descubra quem importa seu produto, em que volume e de quais países com dados reais de comércio exterior.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Acesse o Trade Intelligence", desc: "Navegue até /trade-intelligence. O painel mostra dados de importação e exportação de todos os países." },
              { step: 2, title: "Busque por NCM ou Produto", desc: "Use o campo de busca para encontrar o NCM do seu produto. A ferramenta retorna: volume total, principais importadores, fornecedores e tendências." },
              { step: 3, title: "Analise os Importadores", desc: "Veja a lista de empresas que importam o produto no Brasil. Identifique volume, frequência e países de origem." },
              { step: 4, title: "Identifique Oportunidades", desc: "Compare preços entre países, identifique gaps de mercado e descubra fornecedores que seus concorrentes usam." },
            ].map((s) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-bold shrink-0">{s.step}</div>
                <div><h4 className="font-bold text-slate-800 mb-1">{s.title}</h4><p className="text-sm text-slate-500">{s.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Comece sua análise</h2>
            <p className="text-slate-500 mb-8">Acesse o Trade Intelligence e descubra oportunidades no mercado internacional.</p>
            <Link to="/trade-intelligence" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir Trade Intelligence <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
