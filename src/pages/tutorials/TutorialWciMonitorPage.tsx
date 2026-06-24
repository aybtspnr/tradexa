import { Link } from "react-router-dom";
import { Ship, ArrowRight, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TutorialWciMonitorPage() {
  useSeo({
    title: "Como Monitorar Preços de Frete com o WCI | Tutorial TRADEXA",
    description: "Tutorial: como usar o mapa de frete marítimo da TRADEXA para monitorar preços do WCI e planejar custos logísticos.",
    url: "https://www.tradexa.com.br/tutorial/monitorar-wci",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Monitorar Preços com WCI" },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Sobre este tutorial</h2>
        <p>Este tutorial ensina como monitorar o World Container Index (WCI) usando as ferramentas da TRADEXA. Em 7 minutos você aprende a acompanhar as cotações de frete marítimo em tempo real, identificar tendências de alta e baixa, e escolher o melhor momento para negociar fretes internacionais. O WCI é o principal índice global de preços de container e é usado por importadores e exportadores no mundo todo para planejar suas operações logísticas.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Ship className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Tutorial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Como Monitorar <span className="text-[#D80E16]">Preços de Frete</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Use o mapa de frete marítimo da TRADEXA para acompanhar tendências do WCI e planejar logística.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Acesse o Mapa", desc: "Navegue até /maritime-freight-map. O mapa mostra preços de frete em tempo real para todas as rotas comerciais do Brasil." },
              { step: 2, title: "Selecione a Rota", desc: "Clique em um porto de origem e destino para ver o preço estimado. O mapa usa dados reais do WCI para calcular as tarifas." },
              { step: 3, title: "Analise a Tendência", desc: "Observe se os preços estão subindo ou descendo. O WCI segue padrões sazonais — planeje embarques durante baixas para economizar." },
              { step: 4, title: "Compare Modalidades", desc: "O mapa permite comparar custos entre containers 20' e 40', além de estimar custos por kg para diferentes tipos de carga." },
            ].map((s) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-bold shrink-0">{s.step}</div>
                <div><h4 className="font-bold text-slate-800 mb-1">{s.title}</h4><p className="text-sm text-slate-500">{s.desc}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Dica Pro</h3>
            <p className="text-sm text-slate-600">O WCI segue padrões sazonais previsíveis: picos em junho e novembro, baixas em janeiro e fevereiro. Planeje seus embarques durante as baixas para economizar até 30% no frete.</p>
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Acesse o mapa</h2>
            <p className="text-slate-500 mb-8">Veja preços de frete em tempo real para qualquer rota.</p>
            <Link to="/maritime-freight-map" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir Mapa de Frete <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
