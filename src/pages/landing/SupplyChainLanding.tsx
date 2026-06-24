"use client";
import { Globe, Ship, Plane, Anchor, AlertTriangle, Radio } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function SupplyChainLanding() {
  return (
    <ModuleLandingTemplate
      icon={Globe}
      color="#D80E16"
      title="Supply Chain Map"
      subtitle="Mapa Logístico Global ao Vivo — Gratuito"
      heroDesc="Acompanhe em tempo real navios de carga, aviões cargueiros, portos e aeroportos do mundo inteiro. Dados ao vivo de AIS (navios) e ADS-B (aviões). Ferramenta gratuita e aberta da TRADEXA."
      features={[
        { name: "Navios ao vivo", desc: "Milhares de navios de carga e petroleiros rastreados via AIS com posição, velocidade e destino em tempo real." },
        { name: "Aviões de carga", desc: "Aviões cargueiros rastreados via ADS-B: Boeing 747F, 777F, MD-11F, A300F e mais." },
        { name: "Portos globais", desc: "3.630+ portos marítimos com nome, país e posição geográfica." },
        { name: "Aeroportos", desc: "5.200+ aeroportos grandes e médios com potencial de carga aérea." },
        { name: "Chokepoints", desc: "10 pontos de estrangulamento logístico com nível de risco: Canal de Suez, Panamá, Estreito de Malaca, Ormuz e mais." },
        { name: "Commodities", desc: "Barra de cotações em tempo real: petróleo, ouro, cobre, soja, milho, café." }
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "O Supply Chain Map integra múltiplas fontes de dados ao vivo em um único mapa interativo. Os navios são rastreados via AIS (Automatic Identification System) através do aisstream.io. Os aviões vêm do ADS-B Exchange via adsb.lol. Portos e aeroportos são dados estáticos do World Port Index e OurAirports.",
          bullets: [
            "Dados de navios atualizados a cada poucos segundos via WebSocket AIS",
            "Aviões cargueiros atualizados a cada 15 segundos via ADS-B",
            "Chokepoints com nível de risco (baixo, moderado, elevado, alto, crítico)",
            "Clusterização automática de portos para performance",
            "Clique em qualquer ícone para ver detalhes"
          ]
        },
        {
          title: "Para quem é útil",
          content: "Esta ferramenta é essencial para profissionais de comércio exterior, logística e supply chain que precisam monitorar o movimento global de cargas em tempo real.",
          bullets: [
            "Exportadores e importadores monitorando suas rotas",
            "Operadores logísticos acompanhando congestionamentos",
            "Traders de commodities avaliando disrupções em chokepoints",
            "Analistas de mercado acompanhando fluxos de petróleo e granéis"
          ]
        }
      ]}
      ctaRoute="/supply-chain"
      seoTitle="Supply Chain Map — Logística Global ao Vivo | TRADEXA"
      seoDescription="Acompanhe em tempo real navios de carga, aviões cargueiros, portos e aeroportos do mundo inteiro. Dados ao vivo de AIS e ADS-B. Ferramenta gratuita TRADEXA."
      relatedModules={[
        { label: "Frete Marítimo", route: "/landing/maritime-freight" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" },
        { label: "Trade Intelligence", route: "/landing/import-dashboard" }
      ]}
    />
  );
}
