"use client";
import { Globe } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function GlobalExplorerLanding() {
  return (
    <ModuleLandingTemplate
      icon={Globe}
      color="#8b5cf6"
      title="Explorador Global de Comércio"
      subtitle="Global Trade Explorer"
      heroDesc="Visualize todas as rotas de comércio exterior brasileiro em um mapa-múndi interativo com dados bilaterais completos."
      seoTitle="Explorador Global de Comércio — Mapa Interativo de Rotas | TRADEXA"
      seoDescription="Visualize rotas de comércio exterior brasileiro em mapa interativo. Dados bilaterais completos, balança comercial, modais de transporte e indicadores macroeconômicos."
      features={[
        { name: "Rotas interativas", desc: "Visualização 3D dos fluxos comerciais entre qualquer par de países." },
        { name: "Comparação bilateral", desc: "Balança comercial detalhada entre Brasil e qualquer parceiro." },
        { name: "Modais de transporte", desc: "Proporção de carga marítima, aérea e terrestre por rota." },
        { name: "Dados históricos", desc: "Evolução do comércio bilateral desde 2010." },
        { name: "Top produtos", desc: "Principais NCMs comercializados em cada rota." },
        { name: "Indicadores macro", desc: "PIB, população e facilidade de fazer negócios por país." }
      ]}
      sections={[
        {
          title: "Visão global em segundos",
          content: "O Explorador Global transforma dados complexos de comércio internacional em visualizações intuitivas. Selecione dois países e veja instantaneamente o que é comercializado entre eles.",
          bullets: ["Interface drag-and-drop para selecionar países", "Gráficos de barras comparativos automáticos", "Download de dados por rota"]
        },
      {
          title: "Planejamento estratégico",
          content: "Use o explorador para planejar expansão internacional. Identifique países com alta demanda por produtos brasileiros, baixa concorrência e barreiras tarifárias favoráveis."
        },
      {
          title: "Como usar no seu negócio",
          content: "O Explorador Global de Comércio da TRADEXA permite que exportadores e importadores entendam rapidamente as dinâmicas de comércio entre o Brasil e qualquer outro país. Selecione um país de destino e veja instantaneamente o volume total exportado, os principais produtos (por NCM), a balança comercial, os modais de transporte utilizados e indicadores macroeconômicos como PIB e população. A ferramenta é ideal para prospecção de mercados: antes de investir em uma feira internacional ou contratar um agente no exterior, verifique se aquele país já importa produtos similares do Brasil e em que volume. Também é possível comparar dois ou mais países lado a lado para decidir qual mercado priorizar. Os dados são atualizados mensalmente e vêm de fontes oficiais de comércio exterior, processados e organizados pela nossa equipe de dados. Além do mapa interativo, você pode baixar os dados em CSV para análises próprias no Excel."
        }
      ]}
      ctaRoute="/global-trade"
      relatedModules={[
        { label: "Dashboard Exportação", route: "/landing/export-dashboard" },
      { label: "Oportunidades Exportação", route: "/landing/export-opportunities" },
      { label: "Market Intelligence", route: "/landing/market-intelligence" }
      ]}
    />
  );
}
