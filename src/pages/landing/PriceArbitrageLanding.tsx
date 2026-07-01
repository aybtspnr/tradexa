"use client";
import { Scale } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function PriceArbitrageLanding() {
  return (
    <ModuleLandingTemplate
      icon={Scale}
      color="#f59e0b"
      title="Arbitragem de Preços"
      subtitle="Price Arbitrage"
      heroDesc="Compare preços de produtos entre mercados globais e identifique oportunidades de compra e venda com margens reais."
      seoTitle="Arbitragem de Preços Globais — Compare Mercados | TRADEXA"
      seoDescription="Compare preços de produtos entre 130+ países e descubra oportunidades de arbitragem com margens reais. Dados de comércio exterior."
      features={[
        { name: "Comparação global", desc: "Preços médios de milhares de produtos em 130+ países." },
        { name: "Cálculo de margem", desc: "Impostos, frete, seguro e custos operacionais embutidos." },
        { name: "Oportunidades ranqueadas", desc: "Lista priorizada por margem líquida estimada." },
        { name: "Histórico de preços", desc: "Evolução de preços nos últimos 5 anos por mercado." },
        { name: "Alertas de margem", desc: "Notificações quando uma oportunidade atinge margem mínima configurável." },
        { name: "Simulador de cenários", desc: "Ajuste variáveis e veja o impacto na margem em tempo real." }
      ]}
      sections={[
        {
          title: "Como identificamos oportunidades",
          content: "Cruzamos preços de exportação do país A com preços de importação do país B para o mesmo NCM. A diferença, descontados impostos e logística, revela a margem real de arbitragem.",
          bullets: ["Dados de preços oficiais de cada país", "Cálculo automático de custos totais", "Ranking por potencial de lucro"]
        },
      {
          title: "Exemplo real",
          content: "Produto X é exportado do Brasil a US$ 12/kg e importado pela Alemanha a US$ 28/kg. Com impostos e frete de US$ 6/kg, a margem líquida é de US$ 10/kg — 83% de retorno. Essas são as oportunidades que a TRADEXA revela automaticamente."
        }
      ]}
      ctaRoute="/price-arbitrage"
      relatedModules={[
        { label: "Market Intelligence", route: "/landing/market-intelligence" },
      { label: "Oportunidades Exportação", route: "/landing/export-opportunities" },
      { label: "Explorador Global", route: "/landing/global-explorer" }
      ]}
    />
  );
}
