/**
 * Página de serviço — Pesquisa de Compradores
 */
import { Users, Search } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "pesquisa-compradores",
  title: "Pesquisa de Compradores Internacionais",
  subtitle: "Encontramos compradores qualificados para seus produtos no exterior usando dados reais de importação, feiras e redes comerciais.",
  description: "Combinamos nossa base proprietária de milhões de importadores globais com inteligência humana para identificar, qualificar e conectar você aos compradores ce...",
  icon: Users,
  color: "#2563eb",
  benefits: [
    "Lista qualificada de 10-50 compradores por país-produto",
    "Dados de volume e frequência de importação de cada lead",
    "Mapeamento de fornecedores atuais do comprador (seus concorrentes)",
    "Contatos verificados (email, LinkedIn, telefone quando disponível)",
    "Perfil completo: setor, canais, certificações exigidas",
    "Ranking de prioridade por fit com seu produto",
    "Template de abordagem comercial em inglês/espanhol",
    "Suporte na primeira rodada de contatos",
  ],
  howItWorks: [
    { step: "Definição do perfil", desc: "Definimos juntos o perfil do comprador ideal: país, setor, porte, certificações e canal de distribuição." },
    { step: "Extração de dados", desc: "Nossa plataforma cruza dados de importação dos EUA, UE, China e América Latina para identificar potenciais compradores." },
    { step: "Qualificação", desc: "Nossa equipe verifica cada lead: confirma dados de contato, analisa histórico de importação e valida fit com seu produto." },
    { step: "Entrega", desc: "Você recebe uma planilha com todos os leads + dashboard interativo com análises de cada comprador." },
    { step: "Follow-up", desc: "Acompanhamos por 30 dias com dicas de abordagem e suporte em follow-ups." },
  ],
  faq: [
    { q: "Os contatos são verificados?", a: "Sim. Cada lead passa por verificação de email, telefone e/ou LinkedIn antes de ser entregue." },
    { q: "Qual a origem dos dados?", a: "Utilizamos dados públicos oficiais de importação (US Customs, Eurostat, comércio exterior), complementados por bases comerciais como Dun & Bradstreet, ZoomInfo e pesquisa direta." },
    { q: "Para quais países vocês encontram compradores?", a: "Nossa base cobre 190+ países. Os mais fortes são: EUA, União Europeia, China, Oriente Médio (Emirados, Arábia Saudita), Chile, Colômbia, México e Japão." },
    { q: "Vocês garantem venda?", a: "Não garantimos fechamento de vendas — isso depende do seu produto, preço e negociação. Mas garantimos que os leads são reais, ativos e compatíveis com seu perfil." },
  ],
};

export default function PesquisaCompradoresPage() {
  return <ServicePageTemplate data={data} />;
}
