"use client";
import { Leaf } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CalculadoraCarbonoLanding() {
  return (
    <ModuleLandingTemplate
      icon={Leaf}
      color="#10b981"
      title="Calculadora de Carbono"
      subtitle="Carbon Footprint"
      heroDesc="Calcule a pegada de carbono da sua cadeia logística. Compare emissões entre modais para relatórios ESG e sustentabilidade."
      seoTitle="Calculadora de Carbono — Pegada de CO₂ na Logística | TRADEXA"
      seoDescription="Calcule emissões de CO₂ por modal de transporte: marítimo, aéreo e rodoviário. Dados para ESG, sustentabilidade e compliance ambiental."
      features={[
        { name: "Emissões CO₂", desc: "Cálculo preciso por modal de transporte." },
        { name: "Comparação", desc: "Compare emissões entre marítimo, aéreo e rodoviário." },
        { name: "Relatório ESG", desc: "Dados prontos para relatórios de sustentabilidade." },
        { name: "Distância real", desc: "Cálculo baseado na rota entre portos e aeroportos." },
        { name: "Compensação", desc: "Estimativa de créditos de carbono necessários." },
        { name: "Benchmark", desc: "Compare suas emissões com a média do setor." },
      ]}
      sections={[
        {
          title: "Sustentabilidade na logística",
          content: "Com a crescente pressão regulatória por sustentabilidade, calcular e reportar a pegada de carbono da cadeia logística deixou de ser opcional. Nossa ferramenta simplifica esse cálculo para operações de comércio exterior.",
          bullets: [
            "Cálculo automático baseado em distância e modal",
            "Dados alinhados com padrões internacionais (GLEC Framework)",
            "Relatórios prontos para divulgação ESG",
          ],
        },
        {
          title: "Compare modais de transporte",
          content: "O transporte marítimo emite até 40x menos CO₂ por tonelada-quilômetro que o aéreo. Use nossa calculadora para tomar decisões logísticas mais sustentáveis sem comprometer prazos.",
          bullets: [
            "Marítimo: ~15g CO₂ por tonelada-km",
            "Rodoviário: ~80g CO₂ por tonelada-km",
            "Aéreo: ~600g CO₂ por tonelada-km",
          ],
        },
        {
          title: "Como usar no seu negócio",
          content: "A Calculadora de Carbono da TRADEXA ajuda importadores e exportadores a medir e reportar as emissões de CO₂ da sua cadeia logística internacional. Com a entrada em vigor de regulamentações como o CBAM na União Europeia e a crescente exigência de relatórios ESG por investidores e clientes, conhecer a pegada de carbono das suas operações é um diferencial competitivo. A ferramenta calcula automaticamente as emissões com base na origem, destino, modal de transporte e peso da carga, utilizando fatores de emissão alinhados com o GLEC Framework (Global Logistics Emissions Council). Você pode comparar diferentes cenários — por exemplo, quanto CO₂ sua empresa deixaria de emitir trocando o frete aéreo pelo marítimo. Os resultados podem ser exportados em PDF para incluir em relatórios de sustentabilidade, licitações e comunicados para stakeholders. Ideal para empresas que precisam reportar emissões do Escopo 3 ou que querem se posicionar como sustentáveis no mercado internacional."
        },
      ]}
      ctaRoute="/ferramentas/calculadora-carbono"
    />
  );
}
