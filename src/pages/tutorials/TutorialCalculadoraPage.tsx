import { Link } from "react-router-dom";
import { Calculator, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TutorialCalculadoraPage() {
  useSeo({
    title: "Como Calcular Impostos de Importação | Tutorial TRADEXA",
    description: "Tutorial: como usar a Calculadora de Importação da TRADEXA para calcular todos os tributos de uma importação.",
    url: "https://www.tradexa.com.br/tutorial/calculadora-importacao",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Calcular Impostos de Importação" },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Sobre este tutorial</h2>
        <p>Este tutorial ensina como usar a Calculadora de Impostos de Importação da TRADEXA. Em 12 minutos você aprende a simular todos os tributos de uma importação: II, IPI, PIS, COFINS e ICMS por estado. Com exemplos reais de cálculo, você entende como cada imposto é aplicado, qual a base de cálculo e como regimes especiais como drawback e ex-tarifário podem reduzir seus custos. Essencial para importadores que precisam saber o custo total antes de fechar uma compra internacional.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Calculator className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Tutorial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Como Calcular <span className="text-[#D80E16]">Impostos</span> de Importação</h1>
              <p className="text-lg text-slate-500 max-w-2xl">Tutorial completo para calcular II, IPI, PIS, COFINS e ICMS em operações de importação.</p>
            </motion.div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Acesse a Calculadora", desc: "Navegue até /landing/calculadora-importacao. A ferramenta calcula todos os tributos automaticamente." },
              { step: 2, title: "Insira o Valor FOB", desc: "Digite o valor da mercadoria em dólares (FOB). Inclua o valor real da nota fiscal do fornecedor." },
              { step: 3, title: "Selecione o Estado", desc: "O ICMS varia conforme o estado de destino (4% a 18%). Selecione o estado correto." },
              { step: 4, title: "Veja a Composição", desc: "A calculadora mostra: II, IPI, PIS-Importação, COFINS-Importação, ICMS e o custo total. Compare o custo total com o preço de venda." },
            ].map((s) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-bold shrink-0">{s.step}</div>
                <div><h4 className="font-bold text-slate-800 mb-1">{s.title}</h4><p className="text-sm text-slate-500">{s.desc}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Exemplo Prático</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Produto: Notebooks (NCM 84713011)</p>
              <p>Valor FOB: US$ 10.000</p>
              <p>ICMS (SP): 18%</p>
              <p className="font-bold text-slate-800 mt-3">Custo total estimado: US$ 14.200 (42% de tributos)</p>
            </div>
          </div>
        </section>
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Calcule agora</h2>
            <p className="text-slate-500 mb-8">Use a Calculadora gratuita para estimar os custos da sua importação.</p>
            <Link to="/landing/calculadora-importacao" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Calcular Impostos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
