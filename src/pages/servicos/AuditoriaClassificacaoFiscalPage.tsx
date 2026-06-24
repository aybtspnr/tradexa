/**
 * Página de serviço — Auditoria de Classificação Fiscal
 */
import { FileSearch, FileText } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "auditoria-classificacao-fiscal",
  title: "Auditoria de Classificação Fiscal",
  subtitle: "Revisão completa dos NCMs utilizados pela sua empresa para identificar oportunidades de economia tributária e eliminar riscos de autuação.",
  description: "Nossa equipe de especialistas analisa cada produto do seu portfólio, verifica a classificação fiscal aplicada, identifica NCMs com alíquotas menores permitid...",
  icon: FileSearch,
  color: "#059669",
  benefits: [
    "Relatório completo de todos os NCMs utilizados com análise individual",
    "Identificação de oportunidades de redução legal de impostos (II, IPI, PIS/COFINS)",
    "Mapeamento de ex-tarifários aplicáveis aos seus produtos",
    "Análise de risco — NCMs com histórico de autuação pela Receita Federal",
    "Comparativo: imposto pago hoje vs. imposto devido com classificação correta",
    "Suporte em processo de consulta formal à RFB quando necessário",
    "Estimativa de economia anual com a reclassificação",
    "Acompanhamento na implementação das correções sugeridas",
  ],
  howItWorks: [
    { step: "Coleta de dados", desc: "Envie sua lista de produtos com os NCMs atuais. Nossa equipe analisa cada item individualmente." },
    { step: "Análise técnica", desc: "Cruzamos cada produto com as NESH (Notas Explicativas do SH), decisões da RFB, soluções de consulta e jurisprudência." },
    { step: "Identificação de oportunidades", desc: "Apontamos ex-tarifários, regimes especiais e reclassificações que reduzem legalmente a carga tributária." },
    { step: "Relatório executivo", desc: "Você recebe um dashboard com economia potencial por NCM, riscos identificados e plano de ação priorizado." },
    { step: "Implementação", desc: "Acompanhamos sua equipe na correção dos NCMs, atualização de sistemas e, se necessário, consulta formal à Receita Federal." },
  ],
  faq: [
    { q: "Qual o tamanho mínimo de portfólio para valer a pena?", a: "A partir de 20 produtos já é possível identificar economias relevantes. Para portfólios menores, oferecemos uma análise preliminar gratuita." },
    { q: "Quanto tempo leva a auditoria?", a: "Depende do tamanho do portfólio. Em média, 10 a 15 dias úteis para até 200 NCMs." },
    { q: "Vocês garantem economia?", a: "Não garantimos um valor específico — depende do seu portfólio. Mas em 90% dos casos encontramos oportunidades de redução. Se não houver economia possível, você não paga pelo serviço." },
    { q: "E se a Receita questionar a reclassificação?", a: "Fornecemos todo o embasamento técnico (NESH, jurisprudência, soluções de consulta) para defesa. Se necessário, auxiliamos na consulta formal à RFB." },
  ],
};

export default function AuditoriaClassificacaoFiscalPage() {
  return <ServicePageTemplate data={data} />;
}
