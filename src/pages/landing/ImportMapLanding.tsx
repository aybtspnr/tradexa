"use client";
import { Map } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ImportMapLanding() {
  return (
    <ModuleLandingTemplate
      icon={Map}
      color="#f59e0b"
      title="Mapa de Importações"
      subtitle="Import Map"
      heroDesc="Visualize a distribuição geográfica das importações brasileiras por estado, município e porto em mapa interativo."
      seoTitle="Mapa de Importações Brasileiras — Distribuição Geográfica | TRADEXA"
      seoDescription="Visualize a distribuição geográfica das importações brasileiras por estado, município e porto. Mapa interativo com dados atualizados de comércio exterior."
      features={[
        { name: "Mapa de calor", desc: "Concentração de importações por região com intensidade proporcional ao volume." },
        { name: "Drill-down municipal", desc: "Clique em qualquer município para ver volume, principais produtos, países de origem." },
        { name: "Rotas de importação", desc: "Visualize o caminho completo: país de origem → porto → destino final no Brasil." },
        { name: "Filtro por NCM", desc: "Selecione um código NCM e veja exatamente onde ele entra no país." },
        { name: "Comparação regional", desc: "Compare volumes entre estados e identifique hubs logísticos." },
        { name: "Dados em tempo real", desc: "Atualizado mensalmente com dados atualizados." }
      ]}
      sections={[
        {
          title: "Inteligência geográfica",
          content: "Entender onde as importações entram no Brasil é essencial para planejamento logístico, análise de concorrência regional e identificação de mercados mal atendidos.",
          bullets: ["Identifique os principais portos e aeroportos por produto", "Descubra concentrações regionais de importadores", "Planeje centros de distribuição com base em dados reais"]
        },
      {
          title: "Para quem é?",
          content: "Operadores logísticos, transportadoras, consultores e empresas que precisam entender a geografia do comércio exterior brasileiro."
        }
      ]}
      ctaRoute="/import-intelligence/map"
      relatedModules={[
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Busca Inteligente", route: "/landing/import-search" },
      { label: "Explorador Global", route: "/landing/global-explorer" }
      ]}
    />
  );
}
