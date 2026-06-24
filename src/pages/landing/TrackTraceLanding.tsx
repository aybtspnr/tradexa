"use client";
import { Navigation } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function TrackTraceLanding() {
  return (
    <ModuleLandingTemplate
      icon={Navigation}
      color="#D80E16"
      title="Track & Trace"
      subtitle="Navios e aviões cargueiros ao vivo no mapa"
      badge="Novo — Grátis"
      heroDesc="Acompanhe em tempo real a posição de navios de carga e aviões cargueiros no mapa mundial. Veja velocidade, destino e rota de milhares de embarcações e aeronaves com atualização constante."
      seoTitle="Track & Trace — Navios e Aviões Cargueiros ao Vivo | TRADEXA"
      seoDescription="Acompanhe navios de carga e aviões cargueiros em tempo real no mapa mundial. Posição, velocidade e destino atualizados constantemente."
      features={[
        { name: "Navios ao vivo", desc: "Milhares de navios de carga monitorados com atualização a cada 30 segundos. Filtre por tipo de embarcação." },
        { name: "Aviões cargueiros", desc: "Voos de carga monitorados com posição, altitude, velocidade e modelo da aeronave em tempo real." },
        { name: "Busca inteligente", desc: "Encontre qualquer navio ou voo pelo nome ou identificador. Zoom automático até o alvo." },
        { name: "Mapa mundial", desc: "Cobertura global com zoom suave. Alterne entre visão de navios, aviões ou ambos simultaneamente." },
        { name: "Painel de detalhes", desc: "Clique em qualquer embarcação ou aeronave para ver informações completas: velocidade, direção, destino e previsão de chegada." },
        { name: "Interface premium", desc: "Experiência fluida com animações cinematográficas, ícones elegantes e design responsivo." }
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "O Track & Trace exibe em um mapa mundial interativo a localização atualizada de navios de carga e aviões cargueiros. Os dados são renovados automaticamente a cada poucos segundos, permitindo acompanhar em tempo real o movimento das embarcações e aeronaves.",
          bullets: [
            "Atualização automática a cada 15-30 segundos",
            "Busca por nome ou identificador do navio/voo",
            "Filtro por tipo: navios, aviões ou ambos",
            "Zoom automático com animação suave ao selecionar um alvo",
            "Visualização de velocidade, direção e destino"
          ]
        },
        {
          title: "Para quem é indicado",
          content: "Ideal para profissionais de comércio exterior, logística e supply chain que precisam acompanhar cargas em trânsito marítimo ou aéreo. Também útil para importadores e exportadores que querem monitorar a localização de suas mercadorias.",
          bullets: [
            "Importadores e exportadores — acompanhe sua carga em tempo real",
            "Operadores logísticos — monitore frotas e rotas",
            "Despachantes aduaneiros — antecipe chegadas de mercadorias",
            "Analistas de supply chain — visualize fluxos globais de carga",
            "Curiosos e entusiastas — explore o tráfego marítimo e aéreo mundial"
          ]
        },
        {
          title: "Disponibilidade",
          content: "O Track & Trace está disponível gratuitamente como parte da plataforma TRADEXA. Acesse diretamente pelo navegador, sem necessidade de instalação ou configuração. Compatível com desktop e dispositivos móveis.",
          bullets: [
            "Acesso gratuito e sem cadastro",
            "Funciona em qualquer navegador moderno",
            "Compatível com desktop e mobile",
            "Atualização constante dos dados exibidos",
            "Integrado ao ecossistema de ferramentas TRADEXA"
          ]
        }
      ]}
      ctaRoute="/track-trace"
      relatedModules={[
        { label: "Supply Chain Map", route: "/supply-chain" },
        { label: "Mapa de Frete Marítimo", route: "/maritime-freight-map" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" }
      ]}
    />
  );
}
