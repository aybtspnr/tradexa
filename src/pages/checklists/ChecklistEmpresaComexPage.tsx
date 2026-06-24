import { Link } from "react-router-dom";
import { FileText, CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const passos = [
  { cat: "1. Estruturação da Empresa", items: [
    "Definir natureza jurídica (MEI, ME, EPP, LTDA, S.A.)",
    "Obter CNPJ ativo na Receita Federal",
    "Abrir inscrição estadual e municipal",
    "Abrir conta bancária empresarial",
    "Obter certificado digital (e-CNPJ)",
  ]},
  { cat: "2. Habilitação no Siscomex", items: [
    "Cadastrar empresa no portal Único Siscomex",
    "HabilitarRepresentante Legal ou Despachante",
    "Solicitar chave de acesso ao Siscomex",
    "Cadastrar certificado digital no sistema",
  ]},
  { cat: "3. Regime Tributário", items: [
    "Escolher regime (Lucro Real, Presumido ou Simples)",
    "Cadastrar PIS e COFINS de importação",
    "Verificar enquadramento para benefícios (drawback, RECOF)",
    "Abrir inscrição no INSS e FGTS",
  ]},
  { cat: "4. Equipe e Operação", items: [
    "Contratar ou terceirizar despachante aduaneiro",
    "Contratar contador especializado em comex",
    "Definir processo de control aduaneiro",
    "Implementar sistema de gestão de importação",
  ]},
  { cat: "5. Primeira Operação", items: [
    "Pesquisar fornecedores e produtos",
    "Classificar NCM dos produtos pretendidos",
    "Calcular custo total de importação",
    "Negociação e fechamento com fornecedor",
    "Contratação de frete e seguro",
    "Registro da DI no Siscomex",
  ]},
];

export default function ChecklistEmpresaComexPage() {
  useSeo({
    title: "Como Abrir Empresa de Comércio Exterior — Checklist",
    description: "Passo a passo completo para abrir e habilitar uma empresa para importação e exportação no Brasil.",
    url: "https://www.tradexa.com.br/checklist/empresa-comercio-exterior",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Como Abrir Empresa de Comércio Exterior" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Building2 className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Lead Magnet</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Checklist: <span className="text-[#D80E16]">Empresa de Comércio Exterior</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">Do CNPJ à primeira importação: checklist completo para abrir e operacionalizar sua empresa de comex.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="max-w-3xl">
            <p className="text-slate-600 leading-relaxed text-lg">
              Abrir uma empresa de comércio exterior no Brasil requer planejamento detalhado e o cumprimento 
              de exigências legais específicas em múltiplas etapas. Esta checklist foi desenvolvida por especialistas 
              da TRADEXA para guiar empreendedores desde a constituição da empresa na Junta Comercial até a 
              primeira operação de importação ou exportação. O processo completo leva em média 60 a 90 dias 
              e envolve órgãos como Receita Federal, Siscomex, Secretaria da Fazenda estadual e ANVISA/MAPA 
              para produtos específicos. Seguir este passo a passo ajuda a evitar atrasos, multas e retrabalho, 
              garantindo que sua empresa esteja 100% regularizada e apta a operar no mercado internacional. 
              A checklist é dividida em cinco grandes etapas: estruturação jurídica e fiscal da empresa, 
              habilitação no sistema Siscomex da Receita Federal, definição do regime tributário ideal 
              (Lucro Real, Presumido ou Simples Nacional), montagem da equipe operacional com despachante 
              aduaneiro e contador especializado, e a preparação para a primeira operação incluindo 
              classificação NCM, cálculo de tributos e registro da DI (Declaração de Importação). 
              Cada etapa inclui os documentos necessários, prazos estimados e links para os órgãos 
              competentes, além de dicas práticas para evitar os erros mais comuns de quem está começando.
            </p>
          </div>
          {docs.map((cat, ci) => (
            <motion.div key={cat.cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }}>
              <h2 className="text-xl font-bold mb-4">{cat.cat}</h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors">
                    <div className="w-6 h-6 rounded border-2 border-gray-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Comece sua operação</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">A TRADEXA te ajuda a classificar produtos, calcular impostos e monitorar mercados desde o dia 1.</p>
            <Link to="/services" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Conhecer Ferramentas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
