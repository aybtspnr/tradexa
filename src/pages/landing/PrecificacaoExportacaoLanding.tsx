"use client";
import { TrendingUp } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function PrecificacaoExportacaoLanding() {
  return (
    <ModuleLandingTemplate
      icon={TrendingUp}
      color="#10b981"
      title="Precificação de Exportação"
      subtitle="Export Pricing"
      heroDesc="Calcule o preço final do seu produto no mercado de destino, incluindo frete, seguro, impostos e taxas portuárias."
      seoTitle="Precificação de Exportação — Calcule Margens | TRADEXA"
      seoDescription="Simule todos os custos de exportação: frete internacional, seguro, impostos no destino e taxas para chegar ao preço final competitivo."
      features={[
        { name: "Custos completos", desc: "Frete + seguro + impostos + taxas portuárias." },
        { name: "Preço final", desc: "Valor de venda no mercado de destino." },
        { name: "Margem de lucro", desc: "Calcule sua margem em cada cenário." },
        { name: "Multi-moedas", desc: "Converta automaticamente entre moedas." },
        { name: "Cenários", desc: "Compare diferentes modalidades de frete e Incoterms." },
        { name: "Benchmark", desc: "Compare seu preço com a média de mercado." },
      ]}
      sections={[
        {
          title: "Precifique com precisão",
          content: "Exportadores que não calculam todos os custos logísticos e tributários podem ter margens negativas sem perceber. Nossa ferramenta considera cada componente para chegar ao preço real de venda.",
          bullets: [
            "Inclui frete internacional, seguro e desembaraço",
            "Calcula impostos de importação no país de destino",
            "Projeta margem de lucro em diferentes cenários",
          ],
        },
        {
          title: "Competitividade no exterior",
          content: "O preço final no mercado de destino define sua competitividade. Use nossa calculadora para ajustar margens e encontrar o ponto ideal entre rentabilidade e atratividade para o comprador internacional.",
          bullets: [
            "Compare seu preço com concorrentes locais no destino",
            "Ajuste margens para diferentes mercados e volumes",
            "Simule impacto de acordos comerciais no preço final",
          ],
        },
      ]}
      ctaRoute="/ferramentas/precificacao-exportacao"
    />
  );
}
