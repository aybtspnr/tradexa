import { Link } from "react-router-dom";
import { FileText, CheckCircle, Download, ArrowRight, Ship, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const docs = [
  { cat: "Documentos do Importador", items: [
    "Cadastro na Receita Federal (CNPJ ativo)",
    "Cadastro no Siscomex (Habilitação para operar com DI)",
    "Certificado Digital e-CNPJ A1 ou A3",
    "Comprovação de endereço comercial",
    "Contrato social ou documento constitutivo da empresa",
  ]},
  { cat: "Documentos do Fornecedor (China)", items: [
    "Commercial Invoice (Fatura Comercial) em inglês",
    "Packing Lista ( Lista de Embalagens ) detalhada",
    "Certificado de Origem (CO) - preferencialmente Form A ou E",
    "Bill of Lading (B/L) ou Air Waybill (AWB)",
    "Certificado de Inspeção (CIQ ou SGS, quando aplicável)",
    "Certificado de Qualidade / Conformidade do produto",
  ]},
  { cat: "Documentos Aduaneiros", items: [
    "Declaração de Importação (DI) via Siscomex",
    "Nota Fiscal de Importação (após desembaraço)",
    "LIC (Licença de Importação) - se o produto exigir",
    "Laudo Técnico - para produtos com regulamentação específica",
    "Certificado fitossanitário ou sanitário - para alimentos/plantas",
  ]},
  { cat: "Documentos Financeiros", items: [
    "Ordem de Câmbio (comprovante de pagamento)",
    "Carta de Crédito (se utilizada)",
    "Seguro de Transporte (apólice ou certificado)",
    "Comprovante de recolhimento de tributos",
  ]},
];

export default function ChecklistImportacaoChinaPage() {
  useSeo({
    title: "Checklist: 25 Documentos para Importar da China | TRADEXA",
    description: "Lista completa de 25 documentos necessários para importar da China. Checklist atualizado com todos os documentos aduaneiros, financeiros e do fornecedor.",
    url: "https://www.tradexa.com.br/checklist/importar-china",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Checklist de Documentos para Importação da China", step: docs.map(d => ({ "@type": "HowToStep", name: d.cat, itemListElement: d.items.map(i => ({ "@type": "HowToDirection", text: i })) })) },
    faq: [
      { q: "Precisa de despachante aduaneiro para importar da China?", a: "Não é obrigatório, mas é altamente recomendado. O despachante conhece os procedimentos aduaneiros e pode evitar erros que geram multas e atrasos." },
      { q: "Qual o prazo médio para o desembaraço aduaneiro?", a: "O desembaraço leva de 3 a 7 dias úteis após o registro da DI, podendo ser maior se houver inspeção física pela Receita Federal." },
      { q: "É obrigatório ter certificado digital para importar?", a: "Sim. O certificado digital e-CNPJ é obrigatório para operar no Siscomex e registrar Declarações de Importação." },
    ],
  });

  return (
    <SiteLayout>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Precisa de despachante aduaneiro para importar da China?", acceptedAnswer: { "@type": "Answer", text: "Não é obrigatório, mas é altamente recomendado. O despachante conhece os procedimentos aduaneiros e pode evitar erros que geram multas e atrasos." } },
              { "@type": "Question", name: "Qual o prazo médio para o desembaraço aduaneiro?", acceptedAnswer: { "@type": "Answer", text: "O desembaraço leva de 3 a 7 dias úteis após o registro da DI, podendo ser maior se houver inspeção física pela Receita Federal." } },
              { "@type": "Question", name: "É obrigatório ter certificado digital para importar?", acceptedAnswer: { "@type": "Answer", text: "Sim. O certificado digital e-CNPJ é obrigatório para operar no Siscomex e registrar Declarações de Importação." } },
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <FileText className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Lead Magnet</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Checklist: <span className="text-[#D80E16]">25 Documentos</span> para Importar da China
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">Lista completa e organizada por categoria. Não esqueça nenhum documento na sua próxima importação.</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="max-w-3xl">
            <p className="text-slate-600 leading-relaxed text-lg">
              Importar da China exige organização e atenção a detalhes burocráticos. 
              Esta checklist reúne todos os documentos necessários em cada etapa — do cadastro 
              do importador até o desembaraço aduaneiro. Seguir esta lista ajuda a evitar atrasos 
              na liberação da carga, multas por documentação incompleta e custos extras com 
              armazenagem portuária. Os documentos estão organizados por categoria: documentos 
              do importador (cadastros e habilitações), documentos do fornecedor chinês 
              (fatura, packing list, certificados), documentos aduaneiros (DI, licenças, laudos) 
              e documentos financeiros (câmbio, seguro, tributos). Recomendamos conferir cada 
              item com antecedência — alguns certificados podem levar semanas para serem emitidos 
              pelo fornecedor na China. Se for sua primeira importação, considere contratar um 
              despachante aduaneiro para orientar o processo.
            </p>
          </div>
          {docs.map((cat, ci) => (
            <motion.div key={cat.cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] text-sm font-bold">{ci + 1}</span>
                {cat.cat}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors">
                    <div className="w-6 h-6 rounded border-2 border-gray-600 shrink-0 mt-0.5 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-transparent group-hover:text-[#D80E16]" />
                    </div>
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Pronto para importar?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use a TRADEXA para classificar seus produtos e calcular impostos antes de fechar a compra.</p>
            <Link to="/landing/ncm-classifier" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Classificar NCM <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
