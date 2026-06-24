"use client";
import { FileText } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CalculadoraIncotermsLanding() {
  return (
    <ModuleLandingTemplate
      icon={FileText}
      color="#8b5cf6"
      title="Calculadora de Incoterms"
      subtitle="Incoterms Calculator"
      heroDesc="Compare todos os Incoterms 2020: responsabilidades, custos e quem paga o que em cada modalidade."
      seoTitle="Calculadora de Incoterms 2020 — Compare Responsabilidades | TRADEXA"
      seoDescription="Simule e compare Incoterms 2020: EXW, FOB, CIF, DDP e mais. Veja quem paga frete, seguro, desembaraço em cada termo."
      features={[
        { name: "11 Incoterms 2020", desc: "Cobertura completa: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP." },
        { name: "Matrix de responsabilidade", desc: "Visualize quem paga o que: frete, seguro, desembaraço, carregamento e descarga." },
        { name: "Cálculo dinâmico", desc: "Insira valores FOB, frete e seguro para obter o custo total do comprador." },
        { name: "Comparação lado a lado", desc: "Compare responsabilidades entre dois ou mais Incoterms simultaneamente." },
        { name: "Cenários de custo", desc: "Simule diferentes combinações de frete e seguro para otimizar negociações." },
        { name: "Guia completo", desc: "Descrição detalhada de cada Incoterm com exemplos práticos e dicas." },
      ]}
      sections={[
        {
          title: "Entenda os Incoterms 2020",
          content: "Os Incoterms (International Commercial Terms) definem as responsabilidades entre vendedor e comprador em transações internacionais. Cada termo determina quem paga o frete, seguro, desembaraço e onde ocorre a transferência de risco.",
          bullets: [
            "EXW — O vendedor disponibiliza a mercadoria no seu estabelecimento",
            "FOB — Risco se transfere quando a mercadoria embarca no navio",
            "CIF — Vendedor paga frete e seguro até o porto de destino",
            "DDP — Vendedor arca com todos os custos e desembaraço no destino",
          ],
        },
        {
          title: "Por que usar a Calculadora?",
          content: "Negociar Incoterms corretamente pode gerar economia de milhares de dólares por embarque. Nossa ferramenta ajuda importadores e exportadores a visualizar exatamente onde o custo e o risco mudam de parte.",
          bullets: [
            "Evite surpresas com custos ocultos no destino",
            "Compare rapidamente diferentes modalidades",
            "Fortaleça sua posição de negociação com dados",
          ],
        },
      ]}
      ctaRoute="/ferramentas/calculadora-incoterms"
    />
  );
}
