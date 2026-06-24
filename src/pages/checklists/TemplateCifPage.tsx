import { Link } from "react-router-dom";
import { Calculator, ArrowRight, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TemplateCifPage() {
  useSeo({
    title: "Template: Planilha de Cálculo CIF | TRADEXA",
    description: "Modelo de planilha para cálculo de custo CIF (Cost, Insurance and Freight) de importação. Inclui todos os componentes de custo.",
    url: "https://www.tradexa.com.br/template/planilha-cif",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Template Planilha CIF" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Calculator className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Template</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Planilha de Cálculo <span className="text-[#D80E16]">CIF</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Modelo completo para calcular o custo CIF (Cost, Insurance and Freight) da sua importação.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Componentes do Cálculo CIF</h2>
            <div className="space-y-3">
              {[
                { label: "FOB (Free on Board)", desc: "Preço da mercadoria + transporte até o porto de embarque", icon: DollarSign },
                { label: "Frete Marítimo/Aéreo", desc: "Custo do transporte internacional até o porto de destino", icon: DollarSign },
                { label: "Seguro de Transporte", desc: "Geralmente 0,5% a 2% do valor CIF, dependendo do tipo de carga", icon: DollarSign },
                { label: "Despesas Portuárias", desc: "TUP, taxas de armazenagem, THC (Terminal Handling Charges)", icon: DollarSign },
                { label: "Despesas Documentais", desc: "Conhecimento de embarque, certificado de origem, legalização", icon: DollarSign },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                  <item.icon className="w-6 h-6 text-[#D80E16] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.label}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#D80E16]/10 to-transparent border border-[#D80E16]/20 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-bold mb-3">Fórmula CIF</h3>
              <div className="font-mono text-xl text-slate-800 text-center py-4 bg-slate-100 rounded-xl">
                CIF = FOB + Frete + Seguro
              </div>
              <p className="text-sm text-slate-500 mt-3 text-center">O valor aduaneiro é baseado no CIF para cálculo de tributos na importação.</p>
            </div>

            <p className="text-slate-500 text-sm mt-8">
              Para um cálculo automático, use a Calculadora de Importação da TRADEXA — insira o valor FOB, selecione a rota e obtenha o custo CIF completo com todos os impostos calculados.
            </p>
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Calcule automaticamente</h2>
            <p className="text-slate-500 mb-8">Use a Calculadora de Importação para obter o CIF + impostos em segundos.</p>
            <Link to="/landing/calculadora-importacao" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Calcular Agora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
