"use client";
import { Calculator } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function TariffCalculatorLanding() {
  return (
    <ModuleLandingTemplate
      icon={Calculator}
      color="#ef4444"
      title="Calculadora Tarifária"
      subtitle="Tariff Calculator"
      heroDesc="Simule todos os tributos e custos de uma importação: II, IPI, PIS, COFINS, ICMS e despesas aduaneiras."
      seoTitle="Calculadora de Imposto de Importação — Simule Custos | TRADEXA"
      seoDescription="Simule todos os tributos de importação: II, IPI, PIS, COFINS, ICMS por estado. Calculadora completa de custos aduaneiros para importadores brasileiros."
      features={[
        { name: "Cálculo completo", desc: "Todos os tributos federais, estaduais e taxas em uma única simulação." },
        { name: "ICMS por estado", desc: "Alíquotas atualizadas para todos os 27 estados brasileiros." },
        { name: "Cenários comparativos", desc: "Compare custos entre diferentes origens, modais e regimes tributários." },
        { name: "Frete e seguro", desc: "Estimativas de frete marítimo e aéreo por rota e peso." },
        { name: "Custo total landed", desc: "Valor final do produto posto no seu armazém." },
        { name: "Exportação de simulação", desc: "PDF detalhado com memória de cálculo para compliance." }
      ]}
      sections={[
        {
          title: "Precisão fiscal",
          content: "Nossa calculadora mantém alíquotas atualizadas de todos os tributos, incluindo as particularidades de cada estado brasileiro para ICMS, regimes especiais como drawback e ex-tarifário.",
          bullets: ["Alíquotas atualizadas automaticamente", "Regimes especiais: drawback, ex-tarifário, RECAP", "Memória de cálculo detalhada e auditável"]
        },
      {
          title: "Planejamento financeiro",
          content: "Antes de fechar uma importação, simule o custo total. Compare fornecedores em diferentes países e descubra qual oferece o melhor custo-benefício considerando todos os tributos."
        },
      {
          title: "Como usar no seu negócio",
          content: "A calculadora tarifária da TRADEXA foi desenvolvida para importadores, despachantes e traders que precisam de agilidade na simulação de custos. Em vez de consultar manualmente tabelas de tributos e calculadoras separadas para cada imposto, você tem tudo integrado em uma única ferramenta. Basta informar o valor FOB, a NCM do produto, o estado de destino e o modal de transporte. A ferramenta calcula automaticamente II, IPI, PIS, COFINS, ICMS com a alíquota correta do estado selecionado, taxas portuárias, AFRMM e seguro. O resultado é o custo total landed — o valor real que o produto terá quando chegar ao seu armazém. Também simulamos cenários com regimes especiais como drawback e ex-tarifário, mostrando a economia real em cada caso. Exportadores também podem usar a calculadora para estimar o custo que o importador no exterior terá, ajudando na precificação competitiva. Os cálculos seguem a legislação brasileira vigente e as alíquotas são atualizadas sempre que há mudanças nas tabelas oficiais da Receita Federal e dos estados."
        }
      ]}
      ctaRoute="/tariff-simulator"
      relatedModules={[
        { label: "Classificador NCM", route: "/landing/ncm-classifier" },
      { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Alertas Inteligentes", route: "/landing/smart-alerts" }
      ]}
    />
  );
}
