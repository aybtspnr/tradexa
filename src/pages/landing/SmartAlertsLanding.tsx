"use client";
import { BellRing } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function SmartAlertsLanding() {
  return (
    <ModuleLandingTemplate
      icon={BellRing}
      color="#10b981"
      title="Alertas Inteligentes"
      subtitle="Smart Alerts"
      heroDesc="Configure alertas personalizados para ser notificado sobre mudanças no mercado, oportunidades e riscos em tempo real."
      seoTitle="Alertas Inteligentes de Comércio Exterior | TRADEXA"
      seoDescription="Configure alertas personalizados de mercado, tarifas e sazonalidade. Notificações em tempo real sobre oportunidades e riscos no comércio exterior."
      features={[
        { name: "Alertas de mercado", desc: "Novos importadores, mudanças de volume e tendências emergentes." },
        { name: "Alertas tarifários", desc: "Alterações de alíquotas, novas regulamentações e barreiras comerciais." },
        { name: "Canais múltiplos", desc: "Notificações por email e dashboard em tempo real." },
        { name: "Regras personalizadas", desc: "Crie alertas combinando NCM, país, valor e variação percentual." },
        { name: "Alertas de sazonalidade", desc: "Notificações antecipadas sobre picos e vales sazonais." },
        { name: "Relatórios automáticos", desc: "Receba análises semanais/mensais no seu email." }
      ]}
      sections={[
        {
          title: "Nunca perca uma oportunidade",
          content: "No comércio exterior, timing é tudo. Uma mudança de alíquota, um novo fornecedor ou uma tendência de preço podem representar milhões em oportunidade — ou prejuízo.",
          bullets: ["Monitoramento 24/7 de mudanças no mercado", "Alertas configuráveis por gravidade", "Histórico completo de notificações"]
        },
      {
          title: "Exemplos de alertas",
          content: "Seja notificado quando: um novo importador começar a comprar seu produto, o preço médio de um NCM variar mais de 10% no mês, uma alíquota de imposto for alterada, ou um concorrente aumentar significativamente o volume importado."
        }
      ]}
      ctaRoute="/seasonal-alerts"
      relatedModules={[
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Arbitragem de Preços", route: "/landing/price-arbitrage" },
      { label: "Market Intelligence", route: "/landing/market-intelligence" }
      ]}
    />
  );
}
