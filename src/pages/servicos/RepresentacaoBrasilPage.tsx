/**
 * Página de serviço — Representação no Brasil para Empresas Estrangeiras
 */
import { Globe } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "representacao-brasil",
  title: "Representação Comercial no Brasil",
  subtitle: "Somos seu representante local no Brasil. Prospecção de clientes, gestão de relacionamento, participação em feiras e suporte operacional completo.",
  description: "Empresas estrangeiras que desejam vender no Brasil enfrentam barreiras de idioma, cultura, burocracia e distância. Atuamos como seu braço comercial no país: ...",
  icon: Globe,
  color: "#8b5cf6",
  benefits: [
    "Prospecção ativa de clientes B2B no Brasil por setor e região",
    "Participação em feiras e eventos setoriais representando sua marca",
    "Gestão de relacionamento com distribuidores e revendedores",
    "Suporte em negociações comerciais e follow-up de propostas",
    "Tradução e adaptação de materiais para português",
    "Inteligência de mercado: concorrência, preços, tendências locais",
    "Suporte operacional: despacho aduaneiro, logística, fulfillment",
    "Relatórios mensais de atividade comercial e pipeline de vendas",
  ],
  howItWorks: [
    { step: "Diagnóstico", desc: "Entendemos seu produto, estratégia global e objetivos para o mercado brasileiro em calls de alinhamento." },
    { step: "Plano de entrada", desc: "Desenhamos juntos a estratégia: posicionamento, canais, precificação, metas e cronograma." },
    { step: "Execução comercial", desc: "Nossa equipe prospecta ativamente, agenda reuniões, apresenta seu produto e qualifica oportunidades." },
    { step: "Gestão de pipeline", desc: "Acompanhamos cada lead no CRM, reportamos semanalmente e ajustamos a estratégia conforme resultados." },
    { step: "Suporte contínuo", desc: "Cuidamos da operação: pedidos, logística, pós-venda e suporte ao cliente final." },
  ],
  faq: [
    { q: "Qual o custo da representação?", a: "Trabalhamos com fee mensal fixo + comissão sobre vendas realizadas. O valor depende do escopo (full service vs apenas prospecção). Agende uma call para proposta personalizada." },
    { q: "Vocês têm exclusividade?", a: "Sim, trabalhamos com exclusividade por setor/produto dentro de cada território. Isso garante foco total no seu negócio." },
    { q: "Preciso ter empresa aberta no Brasil?", a: "Não necessariamente no início. Podemos operar como importador por conta e ordem enquanto você avalia o mercado. Depois ajudamos no processo de abertura." },
    { q: "Quanto tempo para ver resultados?", a: "Os primeiros leads qualificados costumam surgir em 60-90 dias. O ciclo de vendas B2B no Brasil é tipicamente de 3-6 meses." },
  ],
};

export default function RepresentacaoBrasilPage() {
  return <ServicePageTemplate data={data} />;
}
