"use client";
import { Anchor } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ComparadorPortosLanding() {
  return (
    <ModuleLandingTemplate
      icon={Anchor}
      color="#3b82f6"
      title="Comparador de Portos"
      subtitle="Port Intelligence"
      heroDesc="Compare os principais portos brasileiros por custo, prazo de desembaraco e eficiencia operacional."
      seoTitle="Comparador de Portos Brasileiros — Custos e Eficiencia | TRADEXA"
      seoDescription="Compare Santos, Paranaqua, Itajai, Rio Grande e mais portos brasileiros: custo por container, tempo de desembaraco e volume anual."
      features={[
        { name: "Multiportos", desc: "Compare Santos, Paranaqua, Itajai, Rio Grande, Salvador, Suape e mais portos brasileiros." },
        { name: "Custo por container", desc: "Custos detalhados de operacao portuaria, armazenagem e movimentacao." },
        { name: "Tempo de desembaraco", desc: "Prazo medio de liberacao aduaneira e eficiencia operacional por porto." },
        { name: "Volume e infraestrutura", desc: "Dados de capacidade, calado, equipamentos e conectividade logistica." },
        { name: "Ranking de eficiencia", desc: "Classificacao comparativa baseada em indicadores reais de desempenho." },
        { name: "Recomendacao inteligente", desc: "Sugestao automatica do melhor porto para sua carga e rota." },
      ]}
      sections={[
        {
          title: "Inteligencia Portuaria",
          content: "A escolha do porto impacta diretamente o custo e o tempo da sua operacao de comercio exterior. Nossa ferramenta compara os principais portos brasileiros com base em dados reais de eficiencia, custo e infraestrutura.",
          bullets: [
            "Dados atualizados de cada porto: volume, calado, equipamentos",
            "Comparacao de custos por TEU (contêiner de 20 pies)",
            "Indice de eficiencia baseado em tempos medios de operacao",
          ],
        },
        {
          title: "Otimize sua operacao",
          content: "Importadores e exportadores que escolhem o porto certo economizam em media 15-20% nos custos logisticos. Use nossa comparacao para tomar decisoes baseadas em dados.",
          bullets: [
            "Analise custo-beneficio entre portos próximos",
            "Considere tempo de traslado interno e conectividade",
            "Compare portos diretos vs transbordo",
          ],
        },
      ]}
      ctaRoute="/ferramentas/comparador-portos"
    />
  );
}
