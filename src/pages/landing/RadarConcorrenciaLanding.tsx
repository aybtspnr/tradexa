"use client";
import { Radio } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function RadarConcorrenciaLanding() {
  return (
    <ModuleLandingTemplate
      icon={Radio}
      color="#D80E16"
      title="Radar de Concorrência"
      subtitle="Competitive Radar"
      heroDesc="Descubra quem são os exportadores brasileiros para cada NCM, para quais países vendem e qual o market share de cada concorrente."
      seoTitle="Radar de Concorrência — Análise de Mercado | TRADEXA"
      seoDescription="Identifique concorrentes por NCM e mercado. Veja ranking de exportadores brasileiros, destinos por país e market share de cada concorrente."
      features={[
        { name: "Ranking por score", desc: "Concorrentes ordenados por evidência e volume." },
        { name: "Mercados por país", desc: "Veja para quais países cada concorrente exporta." },
        { name: "Market share", desc: "Participação relativa de cada empresa no mercado." },
        { name: "Busca por NCM", desc: "Digite o código NCM e veja o radar completo." },
        { name: "Dados verificáveis", desc: "Registros reais de comércio exterior." },
        { name: "Comparação direta", desc: "Compare concorrentes lado a lado." }
      ]}
      sections={[
        {
          title: "O que é o Radar de Concorrência",
          content: "O Radar de Concorrência mapeia o cenário competitivo de qualquer NCM no mercado brasileiro. Ao buscar um código NCM, você vê imediatamente um ranking das empresas que mais exportam aquele produto, os países de destino de cada uma e o market share relativo. É a ferramenta ideal para entender quem são seus concorrentes reais e como o mercado está distribuído.",
          bullets: [
            "Ranking automático por volume de operações",
            "Visualização por país de destino",
            "Market share calculado em tempo real",
            "Comparação entre concorrentes"
          ]
        },
        {
          title: "Para análise competitiva",
          content: "Perfeito para exportadores que querem conhecer a concorrência antes de entrar em um novo mercado, ou para importadores que buscam diversificar fornecedores. O Radar revela quem são os principais players, sua participação no mercado e para quais países estão vendendo."
        },
        {
          title: "Como usar",
          content: "Informe o código NCM desejado na barra de busca. O sistema consulta automaticamente a base de dados e exibe o ranking de empresas, o market share de cada uma e os países de destino. Use os filtros para refinar a análise e clique em qualquer empresa para ver detalhes."
        }
      ]}
      ctaRoute="/radar-concorrencia"
      relatedModules={[
        { label: "Perfil Global Empresa", route: "/company-global-profile" },
        { label: "Comparador Global", route: "/global-trade-comparison" },
        { label: "NCM Global Dashboard", route: "/ncm-global-dashboard" }
      ]}
    />
  );
}
