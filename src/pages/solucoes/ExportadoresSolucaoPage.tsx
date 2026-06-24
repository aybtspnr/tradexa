/**
 * Solução para Exportadores — landing page agrupando ferramentas e serviços
 */
import { BarChart3, TrendingUp, Globe, Ship, Users, Package } from "lucide-react";
import { SolutionPageTemplate, type SolutionPageData } from "@/components/SolutionPageTemplate";

const data: SolutionPageData = {
  slug: "exportadores",
  audience: "Exportadores",
  title: "Exporte para o Mundo com Dados",
  subtitle: "Descubra mercados, encontre compradores, precifique e gerencie a logística internacional com inteligência de mercado.",
  heroDesc: "Analise oportunidades em 130+ países, compare mercados por score inteligente, encontre compradores qualificados, simule preços de exportação e gerencie o frete — tudo integrado.",
  color: "#10b981",
  painPoints: [
    {
      pain: "Descobrir para quais países exportar é um processo subjetivo — faltam dados objetivos para comparar mercados.",
      solution: "O Smart Rank pontua países automaticamente combinando tarifas, demanda, logística e facilidade de fazer negócios. Descubra os melhores mercados para cada produto.",
    },
    {
      pain: "Encontrar compradores internacionais qualificados exige feiras, networking ou catálogos caros — pouco eficiente.",
      solution: "O Diretório de Importadores tem 3.8M+ empresas classificadas por código HS em 97 países. Filtre por país, porte e categoria de produto para gerar leads qualificados.",
    },
    {
      pain: "Precificar produtos para exportação é complexo — envolve Incoterms, tributos brasileiros e do destino, frete e seguro.",
      solution: "Nossas calculadoras de Precificação de Exportação e Incoterms simulam o custo total com margem, tributos e frete. Suba no marketplace com preço correto.",
    },
    {
      pain: "Gerenciar frete internacional, armazenagem e entrega no destino com múltiplos parceiros logísticos é uma dor constante.",
      solution: "Do fulfillment ao frete gerenciado, oferecemos cotação com 20+ armadores, armazenagem em SP/SC/Miami e distribuição B2B/B2C internacional.",
    },
  ],
  tools: [
    { title: "Trade Intelligence", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981", desc: "Dados de exportação brasileira por produto e destino" },
    { title: "Smart Rank", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6", desc: "Ranking de países por oportunidade de mercado" },
    { title: "Explorador Global", route: "/landing/global-explorer", icon: Globe, color: "#06b6d4", desc: "Rotas comerciais e indicadores por país" },
    { title: "Pesquisa de Compradores", route: "/servicos/pesquisa-compradores", icon: Users, color: "#2563eb", desc: "Leads qualificados com histórico de importação" },
    { title: "Pesquisa de Mercado", route: "/servicos/pesquisa-mercado-exportacao", icon: BarChart3, color: "#D80E16", desc: "Análise de potencial por país e concorrência" },
    { title: "Fulfillment Internacional", route: "/servicos/fulfillment", icon: Package, color: "#f59e0b", desc: "Armazenagem, picking e distribuição global" },
    { title: "Cotação de Frete", route: "/servicos/cotacao-frete-internacional", icon: Ship, color: "#0ea5e9", desc: "Cotações com 20+ armadores e agentes" },
  ],
  benefits: [
    "Dados reais de comércio exterior para decisões baseadas em fatos",
    "Score inteligente de mercados — não chute, compare dados objetivos",
    "3.8M+ importadores globais para prospecção direta",
    "Calculadoras de precificação e Incoterms para margem segura",
    "Fulfillment nos principais hubs globais (Brasil, EUA, Europa)",
    "Apoio completo em pesquisa de mercado e compradores",
    "Plano grátis para começar — sem cartão de crédito",
  ],
  ctaRoute: "/register",
};

export default function ExportadoresSolucaoPage() {
  return <SolutionPageTemplate data={data} />;
}
