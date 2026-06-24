"use client";
import { Search } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ImportSearchLanding() {
  return (
    <ModuleLandingTemplate
      icon={Search}
      color="#ef4444"
      title="Busca Inteligente de Importação"
      subtitle="Import Search"
      heroDesc="Encontre importadores por NCM, produto ou razão social com filtros avançados e resultados detalhados."
      seoTitle="Busca Inteligente de Importadores por NCM | TRADEXA"
      seoDescription="Encontre importadores brasileiros por NCM, produto ou empresa. Busca inteligente com filtros por país, estado, porto e período. Resultados com dados atualizados."
      features={[
        { name: "Busca por linguagem natural", desc: "Descreva o produto em português e nossa IA encontra o NCM correspondente automaticamente." },
        { name: "Filtros combinados", desc: "País de origem, estado, município, porto, período e faixa de valor FOB em uma única busca." },
        { name: "Resultados detalhados", desc: "CNPJ do importador, NCM, país, valor FOB, peso líquido, frete e seguro por operação." },
        { name: "Resultados paginados", desc: "Navegue por milhares de registros com paginação rápida e ordenação por qualquer coluna." },
        { name: "Exportação CSV/Excel", desc: "Baixe os resultados da busca em formato CSV ou Excel com um clique." },
        { name: "Histórico de buscas", desc: "Salve e reuse buscas frequentes. Configure alertas baseados em critérios de busca." }
      ]}
      sections={[
        {
          title: "Como funciona",
          content: "Digite o nome de um produto, código NCM, razão social do importador ou qualquer combinação destes. Nossa engine de busca retorna todas as operações de importação correspondentes, com filtros laterais para refinar os resultados.",
          bullets: ["Busca textual em milhões de registros", "Filtros dinâmicos que se adaptam aos resultados", "Resultados instantâneos — mesmo com milhões de registros"]
        },
      {
          title: "Casos de uso",
          content: "A busca inteligente resolve problemas reais do dia a dia de profissionais de comércio exterior.",
          bullets: ["Encontrar todos os importadores de um produto específico no Brasil", "Verificar se um concorrente está importando determinado produto", "Descobrir fornecedores alternativos com melhor preço", "Analisar o volume importado de um NCM por estado"]
        }
      ]}
      ctaRoute="/import-intelligence/search"
      relatedModules={[
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
      { label: "Mapa de Importações", route: "/landing/import-map" },
      { label: "Classificador NCM", route: "/landing/ncm-classifier" }
      ]}
    />
  );
}
