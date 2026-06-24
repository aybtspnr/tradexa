"use client";
import { Layers } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ExportWizardLanding() {
  return (
    <ModuleLandingTemplate
      icon={Layers}
      color="#8b5cf6"
      title="Wizard de Exportação"
      subtitle="Export Wizard"
      heroDesc="Assistente passo a passo que guia novos exportadores do zero à primeira venda internacional."
      seoTitle="Wizard de Exportação — Guia Passo a Passo para Exportar | TRADEXA"
      seoDescription="Guia passo a passo para novos exportadores: classificação de produtos, documentação, match com compradores, simulação financeira e compliance. Do zero à primeira venda internacional."
      features={[
        { name: "7 etapas guiadas", desc: "Da classificação do produto à conexão com compradores internacionais." },
        { name: "Documentação automática", desc: "Checklist de documentos necessários por país e produto." },
        { name: "Match com compradores", desc: "Conexão com importadores ativos no país de destino." },
        { name: "Simulação financeira", desc: "Projeção de custos, receitas e margem da operação." },
        { name: "Compliance check", desc: "Verificação automática de restrições e exigências legais." },
        { name: "Progresso salvo", desc: "Retome de onde parou a qualquer momento." }
      ]}
      sections={[
        {
          title: "Exportar sem medo",
          content: "O Wizard foi projetado para eliminar a barreira de entrada na exportação. Mesmo que você nunca tenha exportado, o assistente guia cada etapa com validações automáticas e dicas contextuais.",
          bullets: ["Interface intuitiva com indicador de progresso", "Validações em tempo real dos dados inseridos", "Dicas contextuais baseadas no produto e destino"]
        },
      {
          title: "Do zero à exportação",
          content: "Etapa 1: Classifique seu produto. Etapa 2: Escolha o mercado-alvo. Etapa 3: Verifique requisitos. Etapa 4: Calcule custos. Etapa 5: Encontre compradores. Etapa 6: Prepare documentação. Etapa 7: Concrete a venda."
        }
      ]}
      ctaRoute="/export-wizard"
      relatedModules={[
        { label: "Dashboard Exportação", route: "/landing/export-dashboard" },
      { label: "Oportunidades Exportação", route: "/landing/export-opportunities" },
      { label: "Calculadora Tarifária", route: "/landing/tariff-calculator" }
      ]}
    />
  );
}
