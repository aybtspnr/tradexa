"use client";
import { Globe, Ship, Anchor, Thermometer, Wind, AlertTriangle } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function PortActivityLanding() {
  return (
    <ModuleLandingTemplate
      icon={Globe}
      color="#D80E16"
      title="Global Port Activity"
      subtitle="Navios nos Portos do Mundo ao Vivo — Gratuito"
      heroDesc="Acompanhe em tempo real a movimentação de navios de carga nos principais portos do mundo. Dados AIS ao vivo com contagem de atracados, fundeados, aproximando, clima no porto e nível de congestionamento. Mais de 3.600 portos monitorados globalmente."
      features={[
        { name: "3.629 portos mundiais", desc: "Todos os portos de carga do mundo com dados ao vivo via AIS satélite. EUA, Brasil, China, Europa, Ásia, África e Oceania." },
        { name: "Navios ao vivo", desc: "Milhares de navios de carga rastreados: container, graneleiro, petroleiro. Posição, velocidade e distância do porto." },
        { name: "Congestionamento", desc: "Percentual de navios fundeados vs atracados em cada porto. Indicador visual 🟢🟡🔴 de quão cheio está o porto." },
        { name: "Clima no porto", desc: "Temperatura, vento, precipitação e condição do tempo em cada porto via Open-Meteo. Dados atualizados automaticamente." },
        { name: "Filtro por país", desc: "Selecione portos de países específicos: EUA, Brasil, China, Alemanha, Japão, Singapura e mais 190 países." },
        { name: "Atualização contínua", desc: "Dados de navios atualizados a cada 30 segundos. Posições AIS via satélite com cobertura global." },
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "O Global Port Activity integra dados AIS (Automatic Identification System) de milhares de navios de carga em tempo real com uma base de 3.629 portos do World Port Index. Para cada porto, calculamos automaticamente quantos navios estão atracados (a menos de 1km e parados), fundeados (em espera, a menos de 3km) ou aproximando (até 15km de distância em movimento). O clima é obtido da Open-Meteo, uma API pública gratuita sem necessidade de chave.",
          bullets: [
            "Navios de carga filtrados por tipo (70-79: container, graneleiro, petroleiro)",
            "Distância calculada via fórmula de haversine para precisão geográfica",
            "Percentual de congestionamento: fundeados / (atracados + fundeados)",
            "Clima obtido sob demanda ao expandir cada porto",
            "Atualização automática a cada 60 segundos"
          ]
        },
        {
          title: "Para quem é útil",
          content: "Esta ferramenta foi projetada para profissionais que precisam de visibilidade em tempo real do tráfego portuário global.",
          bullets: [
            "Importadores e exportadores monitorando prazos de embarque",
            "Operadores logísticos avaliando congestionamentos em portos de destino",
            "Traders de commodities acompanhando filas em portos de carregamento",
            "Analistas de supply chain identificando gargalos logísticos",
            "Profissionais de comercio exterior brasileiro com foco em importação/exportação"
          ]
        }
      ]}
      ctaRoute="/port-activity"
      seoTitle="Global Port Activity — Navios nos Portos ao Vivo | TRADEXA"
      seoDescription="Acompanhe navios de carga nos portos do mundo em tempo real. Dados AIS ao vivo: atracados, fundeados, congestionamento e clima. Mais de 3.600 portos monitorados. Ferramenta gratuita TRADEXA."
      relatedModules={[
        { label: "Supply Chain Map", route: "/landing/supply-chain" },
        { label: "Frete Marítimo", route: "/landing/maritime-freight" },
        { label: "Track & Trace", route: "/landing/track-trace" }
      ]}
    />
  );
}
