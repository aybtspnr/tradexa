"use client";
import { BarChart3 } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function MarketIntelligenceLanding() {
  return (
    <ModuleLandingTemplate
      icon={BarChart3}
      color="#2563eb"
      title="Market Intelligence"
      subtitle="Market Intelligence"
      heroDesc="Análise competitiva avançada com dados cruzados de importação, exportação e indicadores de mercado."
      seoTitle="Market Intelligence para Exportação | TRADEXA"
      seoDescription="Análise competitiva com dados cruzados de importação, exportação e indicadores de mercado. Insights de IA para tomada de decisão estratégica."
      features={[
        { name: "Análise competitiva", desc: "Compare seu desempenho com concorrentes diretos em qualquer mercado." },
        { name: "Tendências IA", desc: "Insights gerados por machine learning sobre padrões e anomalias." },
        { name: "Dados cruzados", desc: "Importação × Exportação × produção nacional em uma única visão." },
        { name: "Indicadores de mercado", desc: "Tamanho do mercado, taxa de crescimento e concentração por setor." },
        { name: "Alertas estratégicos", desc: "Notificações sobre mudanças significativas no mercado." },
        { name: "Dashboards customizados", desc: "Dashboards e análises white-label para seus clientes." }
      ]}
      sections={[
        {
          title: "IA aplicada ao comércio exterior",
          content: "Nossos modelos de machine learning processam milhões de registros para identificar padrões que nenhum humano conseguiria. Sazonalidades ocultas, correlações entre mercados e anomalias que indicam oportunidades.",
          bullets: ["Modelos treinados em dados reais de comércio exterior", "Detecção automática de outliers e tendências", "Previsões de curto prazo baseadas em séries temporais"]
        },
      {
          title: "Para consultores e analistas",
          content: "O módulo de Market Intelligence foi projetado para profissionais que precisam gerar insights para clientes. Dashboards compartilháveis e dados prontos para análise."
        }
      ]}
      ctaRoute="/market-intelligence"
      relatedModules={[
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Dashboard Exportação", route: "/landing/export-dashboard" },
      { label: "Arbitragem de Preços", route: "/landing/price-arbitrage" }
      ]}
    />
  );
}
