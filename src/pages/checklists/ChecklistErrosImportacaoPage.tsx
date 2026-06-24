import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const erros = [
  { erro: "Classificar NCM errado", consequencia: "Multa de até 75% dos tributos + retenção na alfândega", como_evitar: "Use o Classificador NCM com IA e valide com despachante" },
  { erro: "Não calcular ICMS estadual", consequencia: "Custo real 15-20% maior que o planejado", como_evitar: "Calcule o ICMS antes de fechar o pedido" },
  { erro: "Ignorar exigências técnicas", consequencia: "Produto retido ou apreendido na aduana", como_evitar: "Verifique ANVISA/INMETRO antes de comprar" },
  { erro: "Não contratar seguro", consequencia: "Perda total da carga sem ressarcimento", como_evitar: "Seguro All Risks é investimento, não custo" },
  { erro: "Fornecer descrição genérica", consequencia: "Retenção para inspeção física, atrasos de 7-30 dias", como_evitar: "Detalhe composição, material e função do produto" },
  { erro: "Não considerar câmbio", consequencia: "Margem negativa na revenda", como_evitar: "Faça hedge cambial ou precifique com margem de segurança" },
  { erro: "Pular o despachante", consequencia: "Erros processuais, multas, atrasos", como_evitar: "Invista em despachante qualificado, especialmente no início" },
  { erro: "Não verificar licenças", consequencia: "Produto retido, multas, impossibilidade de desembaraço", como_evitar: "Consulte a lista de LI antes de fechar compra" },
];

export default function ChecklistErrosImportacaoPage() {
  useSeo({
    title: "8 Erros Fatais na Importação (e Como Evitar) | TRADEXA",
    description: "Os 8 erros mais comuns que podem custar caro na importação brasileira. Checklist de evitar erros no desembaraço aduaneiro.",
    url: "https://www.tradexa.com.br/checklist/erros-importacao",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "8 Erros Fatais na Importação" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <ShieldAlert className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Lead Magnet</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">8 Erros <span className="text-[#D80E16]">Fatais</span> na Importação</h1>
              <p className="text-lg text-slate-500 max-w-2xl">Erros que podem custar multas, atrasos e até perda de mercadoria. Evite-os com este checklist.</p>
            </motion.div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
          <div className="max-w-3xl mb-8">
            <p className="text-slate-600 leading-relaxed text-lg">
              Erros em processos de importação são mais comuns do que se imagina — e podem custar caro. 
              Esta checklist reúne os erros mais frequentes cometidos por importadores brasileiros, 
              desde a classificação fiscal incorreta da NCM até a falta de documentos obrigatórios. 
              Cada erro listado inclui uma breve explicação de por que ele acontece, qual o impacto 
              financeiro e operacional, e como evitá-lo. Usar esta lista como um guia de verificação 
              antes de cada operação pode economizar milhares de reais em multas, armazenagem e 
              atrasos. Muitos desses erros são evitáveis com planejamento e o uso de ferramentas 
              adequadas como o classificador NCM com IA e a calculadora de tributos da TRADEXA.
            </p>
          </div>
          {erros.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">#{i + 1} {e.erro}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2"><span className="text-xs font-bold text-red-400 shrink-0">Consequência:</span><p className="text-sm text-slate-600">{e.consequencia}</p></div>
                    <div className="flex gap-2"><span className="text-xs font-bold text-green-400 shrink-0">Como evitar:</span><p className="text-sm text-slate-600">{e.como_evitar}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Evite esses erros</h2>
            <p className="text-slate-500 mb-8">A TRADEXA te ajuda a calcular custos corretamente e classificar produtos com precisão.</p>
            <Link to="/landing/calculadora-importacao" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Calcular Importação <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
