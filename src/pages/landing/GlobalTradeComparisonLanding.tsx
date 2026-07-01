"use client";
import { Globe } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function GlobalTradeComparisonLanding() {
  return (
    <ModuleLandingTemplate
      icon={Globe}
      color="#3b82f6"
      title="Comparador Global"
      subtitle="Global Trade Comparison"
      heroDesc="Compare o desempenho exportador do Brasil com os principais concorrentes globais. Veja PIB, exportações totais, market share do NCM e indicadores macroeconômicos."
      seoTitle="Comparador Global — Brasil vs China, EUA e Alemanha | TRADEXA"
      seoDescription="Compare Brasil com China, EUA e Alemanha por NCM. Veja PIB, exportações, market share e indicadores macroeconômicos lado a lado."
      features={[
        { name: "Comparação 4 países", desc: "Brasil, China, EUA e Alemanha lado a lado." },
        { name: "Indicadores macro", desc: "PIB, crescimento, exportações totais por país." },
        { name: "Market share", desc: "Participação relativa de cada país no NCM." },
        { name: "Busca por NCM", desc: "Digite o código e veja a análise comparativa." },
        { name: "Dados históricos", desc: "Evolução temporal dos indicadores." },
        { name: "Exportação PDF", desc: "Relatório completo para apresentações." }
      ]}
      sections={[
        {
          title: "O que é o Comparador Global",
          content: "O Comparador Global coloca Brasil, China, Estados Unidos e Alemanha lado a lado para qualquer NCM que você pesquisar. Veja indicadores macroeconômicos de cada país (PIB, crescimento, exportações totais), o market share específico do NCM pesquisado e a evolução temporal dos fluxos comerciais.",
          bullets: [
            "Comparação simultânea de 4 economias",
            "Indicadores macro por país",
            "Market share do NCM em cada mercado",
            "Dados de fontes internacionais de referência"
          ]
        },
        {
          title: "Para planejamento estratégico",
          content: "Ideal para exportadores que querem entender como o Brasil se posiciona frente aos principais concorrentes globais em um determinado produto. Com o Comparador Global, você identifica vantagens competitivas, gaps de mercado e oportunidades de crescimento."
        },
        {
          title: "Como usar",
          content: "Informe o código NCM desejado. O sistema carrega automaticamente os dados dos 4 países: indicadores macroeconômicos (PIB, crescimento, exportações totais), market share do NCM em cada país e gráficos comparativos. Navegue entre as abas para ver detalhes por país."
        }
      ]}
      ctaRoute="/global-trade-comparison"
      relatedModules={[
        { label: "Perfil Global Empresa", route: "/company-global-profile" },
        { label: "Radar de Concorrência", route: "/radar-concorrencia" },
        { label: "NCM Global Dashboard", route: "/ncm-global-dashboard" }
      ]}
    />
  );
}
