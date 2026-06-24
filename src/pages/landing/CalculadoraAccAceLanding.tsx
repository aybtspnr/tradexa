"use client";
import { TrendingUp } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CalculadoraAccAceLanding() {
  return (
    <ModuleLandingTemplate
      icon={TrendingUp}
      color="#f59e0b"
      title="Calculadora ACC/ACE"
      subtitle="Export Financing"
      heroDesc="Simule o Adiantamento sobre Contrato de Câmbio (ACC) e Adiantamento sobre Cambiais Entregues (ACE) para financiar sua exportação."
      seoTitle="Calculadora ACC/ACE — Financiamento à Exportação | TRADEXA"
      seoDescription="Simule ACC e ACE: compare taxas, juros, spread cambial e prazos de antecipação de até 360 dias para financiar suas exportações."
      features={[
        { name: "ACC e ACE", desc: "Compare as duas modalidades de adiantamento." },
        { name: "Simulação completa", desc: "Taxas, juros e spread cambial em um único lugar." },
        { name: "Prazos flexíveis", desc: "Antecipação de até 360 dias do embarque." },
        { name: "Custo efetivo", desc: "Calcule o custo total da operação de câmbio." },
        { name: "Comparação", desc: "ACC vs ACE lado a lado com valores reais." },
        { name: "Cenários", desc: "Simule diferentes prazos e valores de contrato." },
      ]}
      sections={[
        {
          title: "Financiamento inteligente",
          content: "ACC e ACE são as principais modalidades de financiamento à exportação no Brasil. Com ACC você antecipa recursos antes do embarque; com ACE, após o embarque. Ambas permitem melhorar o fluxo de caixa.",
          bullets: [
            "ACC: antecipação de até 360 dias antes do embarque",
            "ACE: antecipação de até 360 dias após o embarque",
            "Taxas competitivas atreladas ao mercado internacional",
          ],
        },
        {
          title: "Quando usar cada modalidade",
          content: "A escolha entre ACC e ACE depende do ciclo da sua operação. Nossa calculadora ajuda a comparar as duas opções para decidir qual oferece o melhor custo-benefício para o seu negócio.",
          bullets: [
            "ACC ideal para capital de giro na produção",
            "ACE recomendado para antecipar recebíveis pós-embarque",
            "Compare o custo efetivo total em cada cenário",
          ],
        },
      ]}
      ctaRoute="/ferramentas/calculadora-acc-ace"
    />
  );
}
