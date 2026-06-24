import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Search, FileText, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TutorialNcmClassifierPage() {
  useSeo({
    title: "Como Classificar Produtos com NCM — Tutorial TRADEXA",
    description: "Tutorial passo a passo: como usar o Classificador NCM da TRADEXA com inteligência artificial para classificar produtos em segundos.",
    url: "https://www.tradexa.com.br/tutorial/classificador-ncm",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Classificar Produtos com o NCM Lookup", step: [
      { "@type": "HowToStep", name: "Acesse a ferramenta", text: "Acesse /landing/ncm-classifier e clique em 'Classificar com IA'" },
      { "@type": "HowToStep", name: "Descreva o produto", text: "Digite a descrição do produto em linguagem natural (português ou inglês)" },
      { "@type": "HowToStep", name: "Receba o código", text: "A IA retorna o NCM, HS Code e HTS com nível de confiança" },
    ]},
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Sobre este tutorial</h2>
        <p>Este tutorial ensina como usar o classificador NCM com inteligência artificial da TRADEXA. Em 5 minutos você aprende a classificar qualquer produto em NCM, HS Code e HTS usando descrições em linguagem natural. A ferramenta retorna alíquotas completas de II, IPI, PIS, COFINS e ICMS por estado, além do nível de confiança da classificação. Ideal para importadores, exportadores e despachantes que precisam classificar produtos rapidamente sem consultar tabelas manuais.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Tutorial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Como Classificar Produtos com o <span className="text-[#D80E16]">NCM Lookup</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Tutorial passo a passo para classificar qualquer produto usando inteligência artificial.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Acesse a Ferramenta", desc: "Navegue até /landing/ncm-classifier e clique no botão 'Classificar com IA'. A ferramenta funciona no navegador após criar uma conta gratuita na TRADEXA.", tips: ["Use Chrome ou Firefox para melhor experiência", "A ferramenta aceita descrições em português e inglês"] },
              { step: 2, title: "Descreva o Produto", desc: "Digite uma descrição detalhada do produto. Quanto mais específica, melhor a classificação. Inclua: material, função, características técnicas.", tips: ["Exemplo ruim: 'roupa' — genérico demais", "Exemplo bom: 'camiseta de algodão 100% manga curta para homem'"] },
              { step: 3, title: "Analise as Sugestões", desc: "A IA retorna múltiplos códigos NCM com nível de confiança. Analise cada sugestão e verifique se corresponde ao seu produto.", tips: ["Confiança > 85% geralmente é confiável", "Verifique as alíquotas apresentadas para cada código"] },
              { step: 4, title: "Valide com Profissional", desc: "Mesmo com IA, é recomendável validar a classificação com um despachante aduaneiro, especialmente para produtos de alto valor.", tips: ["Mantenha registro da classificação para auditorias", "Consulte o NCM oficial da Receita Federal"] },
            ].map((s) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-extrabold text-lg">{s.step}</div>
                  <h3 className="text-xl font-bold text-slate-800">{s.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="space-y-2">
                  {s.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500">{tip}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Classifique agora</h2>
            <p className="text-slate-500 mb-8">Teste o Classificador NCM gratuito da TRADEXA.</p>
            <Link to="/landing/ncm-classifier" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir NCM Lookup <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
