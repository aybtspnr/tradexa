"use client";
import { BarChart3 } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function NcmGlobalDashboardLanding() {
  return (
    <ModuleLandingTemplate
      icon={BarChart3}
      color="#10b981"
      title="NCM Global Dashboard"
      subtitle="Global NCM Dashboard"
      heroDesc="Visualize em um só lugar: market share, câmbio, SELIC, IPCA, top parceiros, distribuição por país e indicadores macroeconômicos para qualquer NCM."
      seoTitle="NCM Global Dashboard — Análise Completa | TRADEXA"
      seoDescription="Dashboard completo com dados globais de qualquer NCM: market share, câmbio, indicadores macro, top parceiros e distribuição por país. Exporte relatório em PDF."
      features={[
        { name: "KPIs globais", desc: "Market share, câmbio, SELIC, IPCA em um só lugar." },
        { name: "Gráficos interativos", desc: "Barras, pizza e evolução temporal." },
        { name: "Top parceiros", desc: "Maiores países de origem e destino do NCM." },
        { name: "Distribuição por país", desc: "Veja a participação de cada mercado." },
        { name: "Indicadores macro", desc: "Contexto econômico do Brasil e do mundo." },
        { name: "Exportação PDF", desc: "Relatório completo com todos os dados." }
      ]}
      sections={[
        {
          title: "O que é o NCM Global Dashboard",
          content: "O NCM Global Dashboard é o painel mais completo para análise de qualquer código NCM. Ele reúne em uma única tela: KPIs de mercado (market share, volume, valor), indicadores macroeconômicos (câmbio, SELIC, IPCA), top parceiros comerciais, distribuição por país de origem/destino e gráficos interativos de evolução temporal.",
          bullets: [
            "Visão 360° de qualquer NCM",
            "Indicadores macro integrados",
            "Gráficos interativos e exportáveis",
            "Relatório PDF completo"
          ]
        },
        {
          title: "Para análises aprofundadas",
          content: "Perfeito para analistas de mercado, consultores de comércio exterior e tomadores de decisão que precisam de uma visão completa de um produto antes de definir estratégias. O Dashboard elimina a necessidade de consultar múltiplas fontes."
        },
        {
          title: "Como usar",
          content: "Informe o código NCM na barra de busca. O sistema carrega automaticamente todos os indicadores, gráficos e tabelas. Navegue entre as seções para explorar market share, top parceiros, distribuição geográfica e indicadores macro. Use o botão de exportação para gerar um relatório PDF completo."
        }
      ]}
      ctaRoute="/ncm-global-dashboard"
      relatedModules={[
        { label: "Comparador Global", route: "/global-trade-comparison" },
        { label: "Perfil Global Empresa", route: "/company-global-profile" },
        { label: "Radar de Concorrência", route: "/radar-concorrencia" }
      ]}
    />
  );
}
