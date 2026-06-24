"use client";
import { BarChart3 } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ImportDashboardLanding() {
  return (
    <ModuleLandingTemplate
      icon={BarChart3}
      color="#10b981"
      title="Trade Intelligence"
      subtitle="Import & Export Data"
      heroDesc="Dados oficiais de importação e exportação brasileira em um dashboard unificado. Cruze informações de comércio exterior com filtros avançados."
      seoTitle="Trade Intelligence — Dashboard de Importação e Exportação | TRADEXA"
      seoDescription="Dados oficiais de importação e exportação brasileira em dashboard unificado. Cruze informações com filtros por NCM, país, estado e período. Atualizado mensalmente."
      features={[
        { name: "Dados oficiais SISCOMEX", desc: "Registros de importação e exportação com CNPJ, NCM, país, valor FOB, frete e peso." },
        { name: "Filtros combinados", desc: "NCM, país, estado, porto, período e faixa de valor em uma única busca." },
        { name: "Evolução temporal", desc: "Gráficos interativos mensais, trimestrais e anuais desde 2018." },
        { name: "Market share", desc: "Participação de cada fornecedor e país no total, com tendências." },
        { name: "Brasil ↔ EUA", desc: "Dados cruzados entre os dois maiores parceiros comerciais." },
        { name: "Exportação de dados", desc: "CSV e Excel com todos os filtros aplicados." }
      ]}
      sections={[
        { title: "Inteligência unificada", content: "Trade Intelligence consolida dados de importação e exportação em uma única interface. Compare fluxos comerciais, identifique gargalos e descubra oportunidades cruzando oferta e demanda.", bullets: ["Atualização mensal com dados atualizados", "Registros individuais verificáveis", "Comparação lado a lado de períodos e produtos"] },
        { title: "Para quem é?", content: "Importadores, exportadores, traders, consultores de comércio exterior e analistas de mercado que precisam de dados precisos para tomar decisões estratégicas." }
      ]}
      ctaRoute="/trade-intelligence"
      relatedModules={[
        { label: "Smart Rank", route: "/landing/export-opportunities" },
        { label: "Mapa de Importadores", route: "/landing/import-map" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" }
      ]}
    />
  );
}
