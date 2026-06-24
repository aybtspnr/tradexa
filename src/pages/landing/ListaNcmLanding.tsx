"use client";
import { Search } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ListaNcmLanding() {
  return (
    <ModuleLandingTemplate
      icon={Search}
      color="#3b82f6"
      title="Lista NCM — Busca por Código ou Descrição"
      subtitle="NCM Code Search"
      heroDesc="Pesquise qualquer código NCM por número, descrição ou palavra-chave. Base completa com mais de 15.000 códigos classificados por capítulo."
      seoTitle="Lista NCM Completa — Busca por Código ou Descrição | TRADEXA"
      seoDescription="Lista completa de códigos NCM com busca por código ou descrição. Classificação fiscal de mercadorias com alíquotas e regulamentações. Atualizada 2026."
      features={[
        { name: "Busca por código", desc: "Pesquise diretamente por número NCM (ex: 8471.30.12) e obtenha todos os detalhes fiscais instantaneamente." },
        { name: "Busca por descrição", desc: "Encontre códigos NCM digitando palavras-chave em português ou inglês sobre o produto que deseja classificar." },
        { name: "Navegação por capítulo", desc: "Explore os 97 capítulos da tabela NCM com navegação hierárquica e filtros por seção e posição." },
        { name: "Classificação IA", desc: "Envie a descrição do seu produto e a inteligência artificial sugere o código NCM mais adequado." },
        { name: "Comparação HS/HTS", desc: "Veja lado a lado o código NCM brasileiro, o HS internacional e o HTS dos EUA para o mesmo produto." },
        { name: "Códigos favoritos", desc: "Salve os códigos NCM que você consulta frequentemente para acesso rápido na próxima visita." }
      ]}
      sections={[
        {
          title: "Base de dados completa e atualizada",
          content: "A tabela NCM (Nomenclatura Comum do Mercosul) é o sistema de classificação de mercadorias utilizado no Brasil para fins de tributação e regulação do comércio exterior. Nossa base contém todos os códigos vigentes em 2026.",
          bullets: ["Mais de 15.000 códigos NCM com descrições detalhadas", "Atualizada automaticamente conforme alterações legislativas", "Alíquotas de II, IPI, PIS e COFINS vinculadas a cada código"]
        },
        {
          title: "Classificação inteligente com IA",
          content: "Não sabe o código NCM do seu produto? Descreva o produto em linguagem natural e nossa inteligência artificial analisa as características, composição e uso para sugerir o código de classificação correto, reduzindo riscos de autuação na alfândega."
        }
      ]}
      ctaRoute="/ai-search"
      relatedModules={[
        { label: "Classificador NCM", route: "/landing/ncm-classifier" },
        { label: "Consulta HTS", route: "/landing/hts-lookup" },
        { label: "Comparação de Países", route: "/landing/country-comparison" }
      ]}
    />
  );
}
