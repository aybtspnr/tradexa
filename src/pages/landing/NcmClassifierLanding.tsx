"use client";
import { Bot } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function NcmClassifierLanding() {
  return (
    <ModuleLandingTemplate
      icon={Bot}
      color="#D80E16"
      title="Classificador IA de NCM"
      subtitle="NCM/HTS Classifier"
      heroDesc="Classificação automática de produtos por inteligência artificial. Descreva o produto em português e receba NCM, HS e HTS em segundos."
      seoTitle="Classificador NCM com IA — Códigos NCM, HS e HTS Automáticos | TRADEXA"
      seoDescription="Classificação automática de produtos em NCM, HS e HTS com inteligência artificial. Descreva o produto em português e receba alíquotas completas."
      features={[
        { name: "Processamento em linguagem natural", desc: "Descreva qualquer produto em português — a IA entende contexto e nuances." },
        { name: "Classificação tripla", desc: "NCM (Brasil), HS (global) e HTS (EUA) em uma única consulta." },
        { name: "Alíquotas completas", desc: "II, IPI, PIS, COFINS, ICMS por estado e taxas federais." },
        { name: "Histórico e favoritos", desc: "Salve classificações frequentes e consulte o histórico." },
        { name: "Regulamentações", desc: "Restrições, cotas e exigências especiais por NCM." },
        { name: "API disponível", desc: "Integre o classificador ao seu ERP ou sistema de compras." }
      ]}
      sections={[
        {
          title: "Tecnologia",
          content: "Nosso classificador utiliza modelos de linguagem treinados especificamente na Nomenclatura Comum do Mercosul (NCM) e no Sistema Harmonizado (HS). Ele entende descrições técnicas, nomes comerciais e até gírias do setor.",
          bullets: ["Modelo treinado em toda a tabela NCM/HS", "Confiança percentual em cada classificação", "Sugestão de NCMs alternativos quando aplicável"]
        },
      {
          title: "Para quem é?",
          content: "Despachantes aduaneiros, importadores, exportadores, consultores tarifários e qualquer profissional que lida com classificação fiscal de mercadorias."
        }
      ]}
      ctaRoute="/hts-lookup"
      relatedModules={[
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Calculadora Tarifária", route: "/landing/tariff-calculator" },
      { label: "Busca Inteligente", route: "/landing/import-search" }
      ]}
    />
  );
}
