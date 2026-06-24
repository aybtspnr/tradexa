import { Link } from "react-router-dom";
import { Users, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function TutorialImportadoresPage() {
  useSeo({
    title: "Como Encontrar Importadores com a TRADEXA | Tutorial",
    description: "Tutorial: como usar a ferramenta de Importadores para descobrir empresas que compram seu produto no Brasil.",
    url: "https://www.tradexa.com.br/tutorial/importadores",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Encontrar Importadores com a TRADEXA" },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Sobre este tutorial</h2>
        <p>Este tutorial ensina como usar o Diretório de Importadores da TRADEXA para encontrar compradores internacionais qualificados. Em 8 minutos você aprende a buscar importadores por código HS e país, filtrar por porte de empresa e categoria de produto, e exportar listas de contatos para prospecção B2B. O diretório contém milhões de empresas importadoras em 97 países com dados de contato verificados.</p>
      </div>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Users className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Tutorial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Como Encontrar <span className="text-[#D80E16]">Importadores</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Descubra quem importa seu produto e como entrar em contato com potenciais clientes.</p>
            </motion.div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Acesse a Ferramenta", desc: "Navegue até /importadores. A ferramenta lista empresas brasileiras que realizam importações." },
              { step: 2, title: "Busque por HS Code", desc: "Insira o código HS do produto (6 dígitos). A ferramenta retorna empresas que importam esse tipo de produto." },
              { step: 3, title: "Analise os Resultados", desc: "Veja volume de importação, frequência, países de origem e tendências de compra de cada empresa." },
              { step: 4, title: "Entre em Contato", desc: "Use os dados para criar uma lista de prospecção. Foque nas empresas com maior volume e frequência." },
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
            <h2 className="text-3xl font-extrabold mb-4">Encontre seus clientes</h2>
            <p className="text-slate-500 mb-8">Acesse a ferramenta de Importadores e descubra oportunidades.</p>
            <Link to="/importadores" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Abrir Importadores <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
