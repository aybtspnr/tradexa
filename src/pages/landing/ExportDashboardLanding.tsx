"use client";
import { TrendingUp } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ExportDashboardLanding() {
  return (
    <ModuleLandingTemplate
      icon={TrendingUp}
      color="#10b981"
      title="Dashboard de Exportação"
      subtitle="Export Intelligence"
      heroDesc="Acompanhe o desempenho das exportações brasileiras por produto, destino e período com dashboards interativos."
      seoTitle="Dashboard de Exportação — Dados Brasileiros de Comércio | TRADEXA"
      seoDescription="Acompanhe exportações brasileiras por produto, destino e período. Dashboards interativos com dados atualizados, market share Brasil, preços médios e sazonalidade."
      features={[
        { name: "Top destinos", desc: "Ranking de países por volume e valor exportado, com evolução temporal." },
        { name: "Preços médios", desc: "Evolução de preços por NCM e destino, com comparação internacional." },
        { name: "Market share Brasil", desc: "Participação do Brasil no mercado global por produto." },
        { name: "Sazonalidade", desc: "Padrões sazonais de exportação por produto e destino." },
        { name: "Modais de transporte", desc: "Distribuição entre marítimo, aéreo e terrestre." }
      ]}
      sections={[
        {
          title: "Dados Oficiais",
          content: "Nossa base de exportação é alimentada diretamente por dados atualizados do governo brasileiro, processados e enriquecidos com análises de IA.",
          bullets: ["Registros individuais de exportação", "Dados atualizados mensalmente", "Classificação NCM com 8 dígitos"]
        },
      {
          title: "Inteligência competitiva",
          content: "Compare o desempenho exportador do Brasil com outros países. Identifique produtos onde o Brasil está ganhando ou perdendo market share.",
          bullets: ["Ranking global por NCM", "Comparação com principais concorrentes", "Tendências de crescimento por mercado"]
        },
      {
          title: "Como usar no seu negócio",
          content: "O Dashboard de Exportação da TRADEXA é a ferramenta ideal para exportadores que querem entender o mercado antes de tomar decisões. Com ele você descobre quais produtos brasileiros estão em alta no mercado internacional, quais países estão aumentando suas importações do Brasil e qual o preço médio praticado em cada destino. A ferramenta permite filtrar por NCM, país de destino, estado brasileiro exportador e período, gerando dashboards interativos com evolução temporal, market share e sazonalidade. Para empresas que já exportam, é uma forma de monitorar a concorrência e identificar tendências de preço. Para quem quer começar a exportar, ajuda a escolher o produto e o mercado com maior potencial, baseado em dados reais e não em suposições. Os dados são processados a partir de registros oficiais de exportação brasileira e organizados de forma intuitiva, sem necessidade de conhecimento técnico em análise de dados."
        }
      ]}
      ctaRoute="/export-intelligence"
      relatedModules={[
        { label: "Oportunidades Exportação", route: "/landing/export-opportunities" },
      { label: "Explorador Global", route: "/landing/global-explorer" },
      { label: "Wizard Exportação", route: "/landing/export-wizard" }
      ]}
    />
  );
}
