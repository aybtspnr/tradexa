/**
 * Página de serviço — Despacho Aduaneiro
 */
import { Shield } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "despacho-aduaneiro",
  title: "Despacho Aduaneiro de Importação e Exportação",
  subtitle: "Assessoria completa em despacho aduaneiro de importação e exportação no Brasil, em portos, aeroportos e fronteiras secas.",
  description: "Nossa rede de despachantes aduaneiros credenciados cobre os principais portos, aeroportos e pontos de fronteira do Brasil. Oferecemos assessoria completa: cl...",
  icon: Shield,
  color: "#10b981",
  benefits: [
    "Despachantes credenciados em todos os estados brasileiros",
    "Desembaraço em portos: Santos, Paranaguá, Itajaí, Rio Grande, Suape, Rio de Janeiro",
    "Desembaraço em aeroportos: Guarulhos, Viracopos, Galeão, Confins",
    "Classificação fiscal NCM/HTS e cálculo de tributos",
    "Elaboração de DI (Declaração de Importação) e DU-E (Exportação)",
    "Licenciamento em órgãos anuentes: ANVISA, MAPA, INMETRO, DECEX",
    "Acompanhamento de canais de parametrização (verde, amarelo, vermelho)",
    "Despacho no destino com parceiros em 15+ países",
  ],
  howItWorks: [
    { step: "Análise documental", desc: "Recebemos e conferimos todos os documentos necessários: invoice, packing list, BL/AWB, certificados." },
    { step: "Classificação e tributos", desc: "Classificamos a mercadoria no NCM correto e calculamos todos os tributos incidentes (II, IPI, PIS, COFINS, ICMS)." },
    { step: "Registro e licenciamento", desc: "Registramos a DI/DU-E no Siscomex e tratamos de licenças em órgãos anuentes quando necessário." },
    { step: "Acompanhamento", desc: "Monitoramos a parametrização e atuamos rapidamente em caso de exigência fiscal ou conferência física." },
    { step: "Liberação e entrega", desc: "Após o desembaraço, coordenamos o transporte interno até o destino final, se necessário." },
  ],
  faq: [
    { q: "Quanto custa um despachante aduaneiro?", a: "Os honorários variam de R$ 800 a R$ 3.000 por processo, dependendo da complexidade, quantidade de itens e regime aduaneiro. Enviamos orçamento após analisar sua operação." },
    { q: "Quanto tempo demora o desembaraço?", a: "Em média 3-7 dias úteis para canais verde e amarelo. Canal vermelho ou exigências fiscais podem estender para 15-30 dias." },
    { q: "Fazem desembaraço no exterior também?", a: "Sim! Temos parceiros despachantes nos EUA, Alemanha, China, Chile, Colômbia, México, Portugal e outros. O serviço de destino é contratado separadamente." },
    { q: "Atendem pessoa física?", a: "Sim, atendemos tanto pessoas jurídicas quanto pessoas físicas, incluindo remessas postais e bagagem desacompanhada." },
  ],
};

export default function DespachoAduaneiroPage() {
  return <ServicePageTemplate data={data} />;
}
