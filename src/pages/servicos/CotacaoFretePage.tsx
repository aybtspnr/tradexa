/**
 * Página de serviço — Cotação de Frete Internacional
 */
import { Ship } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "cotacao-frete-internacional",
  title: "Cotação de Frete Internacional",
  subtitle: "Comparamos cotações de frete marítimo, aéreo e rodoviário com múltiplos armadores e agentes para você escolher a melhor opção custo-benefício.",
  description: "Trabalhamos com uma rede de 20+ armadores, agentes de carga e transportadoras para oferecer cotações competitivas em todas as modalidades. Nossa plataforma a...",
  icon: Ship,
  color: "#0ea5e9",
  benefits: [
    "Cotação com 3-5 armadores/agentes por solicitação",
    "Comparativo por modal: marítimo FCL/LCL, aéreo, rodoviário",
    "Inclusão de custos acessórios: THC, BAF, ISPS, capatazia",
    "Estimativa de transit time porta-a-porta",
    "Rastreamento da carga durante todo o trajeto",
    "Suporte para documentação: BL, AWB, CRT",
    "Negociação de tarifas por volume recorrente",
    "Assessoria em seguro internacional de carga",
  ],
  howItWorks: [
    { step: "Solicitação", desc: "Você informa: origem, destino, tipo de carga, peso/volume, Incoterm e urgência." },
    { step: "Cotação multicanal", desc: "Disparamos cotações para nossa rede de parceiros e compilamos as respostas." },
    { step: "Comparativo", desc: "Apresentamos uma tabela comparativa com preço total (all-in), transit time e confiabilidade do armador." },
    { step: "Fechamento", desc: "Você escolhe a melhor opção. Cuidamos da reserva, documentação e coordenação logística." },
    { step: "Tracking", desc: "Acompanhe sua carga em tempo real com atualizações por email." },
  ],
  faq: [
    { q: "Quanto tempo para receber a cotação?", a: "Cotações marítimas: 24-48 horas. Cotações aéreas: 4-8 horas. Cotações urgentes: prioritárias." },
    { q: "Vocês trabalham com quais armadores?", a: "Temos parceria com MSC, Maersk, CMA CGM, Hapag-Lloyd, COSCO, Evergreen, além de NVOCCs e agentes locais nos principais portos." },
    { q: "Fazem cotação para importação também?", a: "Sim! Atendemos tanto exportação quanto importação em todas as modalidades." },
    { q: "O frete inclui desembaraço aduaneiro?", a: "O frete cobre o transporte internacional. Para desembaraço, oferecemos o serviço separado de Despacho Aduaneiro. Podemos combinar ambos com desconto." },
  ],
};

export default function CotacaoFretePage() {
  return <ServicePageTemplate data={data} />;
}
