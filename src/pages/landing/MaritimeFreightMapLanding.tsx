"use client";
import { Ship } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function MaritimeFreightMapLanding() {
  return (
    <ModuleLandingTemplate
      icon={Ship}
      color="#D80E16"
      title="Mapa de Frete Marítimo"
      subtitle="Rotas e cotações interativas no globo 3D"
      badge="Beta — Grátis por tempo limitado"
      heroDesc="Mapa 3D interativo com todas as rotas de frete marítimo. Preços atualizados pelo World Container Index (WCI) com margem de 30%. Clique nos portos, compare cotações de diferentes armadores e solicite preços diretamente no mapa."
      seoTitle="Mapa de Frete Marítimo 3D — Rotas e Cotações Interativas | TRADEXA"
      seoDescription="Mapa 3D interativo de rotas de frete marítimo. Preços atualizados pelo World Container Index. Simule rotas e cotações."
      features={[
        { name: "Mapa 3D interativo", desc: "Globo terrestre com rotas marítimas reais entre portos do mundo inteiro com navios animados." },
        { name: "Preços indexados ao WCI", desc: "Cotações ajustadas automaticamente pelo World Container Index, o principal benchmark global de frete." },
        { name: "Cotações por rota", desc: "Clique em qualquer porto e veja preços de 20' GP e 40' HC de múltiplos armadores." },
        { name: "Cotação sob demanda", desc: "Solicite cotação completa e atualizada diretamente pelo mapa. Enviamos para seu email." },
        { name: "Rotas detalhadas", desc: "Traçado marítimo real passando pelos principais chokepoints globais — sem cruzar terra." },
        { name: "Grátis por tempo limitado", desc: "Aproveite agora! Depois do beta, disponível apenas no plano Business." }
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "O mapa carrega automaticamente todas as rotas de frete disponíveis na nossa base. Cada ponto no mapa representa um porto. Clique para ver todas as rotas daquele porto, selecione uma e veja as cotações detalhadas de cada armador com preços já ajustados pelo índice WCI.",
          bullets: [
            "Linhas seguem as rotas marítimas reais (sem cruzar terra)",
            "Navios animados mostram o fluxo do transporte",
            "Cards com preços 20' GP e 40' HC com margem de 30%",
            "Solicitação de cotação completa por email",
            "Preços atualizados pelo World Container Index"
          ]
        },
        {
          title: "Corredores disponíveis",
          content: "Atualmente cobrimos os principais corredores de importação e exportação do Brasil, com cotações atualizadas e indexadas ao WCI.",
          bullets: [
            "China → Brasil (Shanghai, Ningbo, Shenzhen → Santos, Itajaí, Paranaguá)",
            "Índia → Brasil (Nhava Sheva, Mundra → Pecém, Rio Grande)",
            "Brasil → EUA (Santos, Rio Grande → New York, Jacksonville)",
            "EUA → Brasil (New York, Port Everglades → Santos, Rio de Janeiro)"
          ]
        },
        {
          title: "Precificação",
          content: "Os preços exibidos no mapa incluem uma margem de 30% sobre o valor base e são ajustados automaticamente pelo World Container Index (WCI), garantindo que você sempre veja valores próximos do mercado atual.",
          bullets: [
            "Margem de 30% inclusa nos preços exibidos",
            "Ajuste automático pelo WCI (World Container Index)",
            "Cotações sob demanda enviadas por email",
            "Gratuito durante o período Beta",
            "Após o Beta: exclusivo para plano Business"
          ]
        }
      ]}
      ctaRoute="/maritime-freight-map"
      relatedModules={[
        { label: "Supply Chain Map", route: "/supply-chain" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" },
        { label: "Diretório Importadores", route: "/landing/importadores" }
      ]}
    />
  );
}
