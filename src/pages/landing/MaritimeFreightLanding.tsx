"use client";
import { Ship } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function MaritimeFreightLanding() {
  return (
    <ModuleLandingTemplate
      icon={Ship}
      color="#0ea5e9"
      title="Frete Marítimo"
      subtitle="Maritime Freight — Beta"
      heroDesc="Compare cotações de frete marítimo entre portos do mundo inteiro. FCL, LCL com taxas portuárias incluídas. Dados reais atualizados."
      seoTitle="Frete Marítimo FCL — Cotações de Container entre Portos | TRADEXA"
      seoDescription="Compare cotações de frete marítimo FCL e LCL entre portos do mundo. Preços de container 20' e 40' com taxas portuárias inclusas. Dados reais atualizados."
      features={[
        { name: "Cotações FCL/LCL", desc: "Preços reais de carriers internacionais para container completo ou carga consolidada." },
        { name: "Comparativo de portos", desc: "Origem × destino com todas as taxas e sobretaxas incluídas." },
        { name: "Índice de frete", desc: "Acompanhe tendências e variações de preço ao longo do tempo." },
        { name: "Múltiplos portos", desc: "Compare rotas entre diferentes portos de origem e destino." },
        { name: "Taxas portuárias", desc: "THC, AFRMM, taxa SISCOMEX e despesas incluídas no cálculo." },
        { name: "Atualização frequente", desc: "Dados mantidos com cotações recentes do mercado." }
      ]}
      sections={[
        {
          title: "Planeje sua logística",
          content: "O frete internacional é um dos maiores custos do comércio exterior. Nossa ferramenta permite comparar cotações entre múltiplos portos e escolher a rota mais econômica para sua operação.",
          bullets: [
            "Container 20' e 40' (FCL) e carga consolidada (LCL)",
            "Taxas portuárias e sobretaxas incluídas",
            "Comparação lado a lado de até 5 rotas"
          ]
        },
        {
          title: "Funcionalidade em Beta",
          content: "Esta ferramenta está em fase de aprimoramento. Os dados de frete são atualizados periodicamente e representam valores de referência do mercado. Para cotações firmes, recomendamos contato direto com agentes de carga."
        }
      ]}
      ctaRoute="/maritime-freight-map"
      relatedModules={[
        { label: "Tarifário Global", route: "/landing/tariff-calculator" },
        { label: "Trade Intelligence", route: "/landing/import-dashboard" },
        { label: "Port Intelligence", route: "/landing/global-explorer" }
      ]}
    />
  );
}
