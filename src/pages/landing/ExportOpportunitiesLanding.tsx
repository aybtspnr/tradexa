"use client";
import { TrendingUp } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ExportOpportunitiesLanding() {
  return (
    <ModuleLandingTemplate
      icon={TrendingUp}
      color="#8b5cf6"
      title="Smart Rank"
      subtitle="Country Opportunity Ranking"
      heroDesc="Compare países por potencial de mercado usando alíquotas reais, demanda, logística e competitividade. Descubra qual o melhor destino para seu produto."
      seoTitle="Smart Rank — Oportunidades de Exportação por País | TRADEXA"
      seoDescription="Descubra os melhores países para exportar seu produto. Ranking inteligente por alíquotas reais, demanda, logística e competitividade. Score automático de 0 a 100."
      features={[
        { name: "Score automático", desc: "Ponderação de tarifa, demanda, frete, facilidade de negócios e acordos comerciais." },
        { name: "Comparação lado a lado", desc: "Até 5 países simultaneamente com breakdown de cada critério." },
        { name: "Dados CTS oficiais", desc: "Alíquotas da OMC para 31 países integradas ao algoritmo de ranking." },
        { name: "VAT e impostos", desc: "Imposto sobre valor agregado e taxas adicionais por país." },
        { name: "Simulador de cenários", desc: "Altere pesos dos critérios e veja como o ranking muda." },
        { name: "Sugestões inteligentes", desc: "Destaque automático para países com menor tarifa e maior demanda." }
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "O Smart Rank analisa cada país-destino usando 5 critérios: tarifa de importação, tamanho do mercado, custo logístico, facilidade de fazer negócios e acordos comerciais. O resultado é um score de 0 a 100 que ranqueia os melhores mercados para seu produto.",
          bullets: [
            "Tarifa OMC real (não estimativas)",
            "VAT e taxas adicionais incluídos",
            "Pesos ajustáveis conforme sua estratégia"
          ]
        },
        {
          title: "Para quem é?",
          content: "Exportadores definindo estratégia de mercado, consultores preparando recomendações para clientes, e empresas avaliando diversificação de destinos de exportação."
        }
      ]}
      ctaRoute="/smart-rank"
      relatedModules={[
        { label: "Trade Intelligence", route: "/landing/import-dashboard" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" },
        { label: "Diretório Importadores", route: "/landing/importadores" }
      ]}
    />
  );
}
