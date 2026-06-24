"use client";
import { Database } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ImportadoresLanding() {
  return (
    <ModuleLandingTemplate
      icon={Database}
      color="#ef4444"
      title="Diretório de Importadores"
      subtitle="Global Importers Directory"
      heroDesc="Acesse milhões de empresas importadoras do mundo inteiro classificadas por código HS. Encontre compradores qualificados para seus produtos."
      seoTitle="Diretório de Importadores — 3.8M+ Empresas por HS Code | TRADEXA"
      seoDescription="Acesse milhões de importadores reais em 97 países classificados por código HS. Encontre compradores qualificados para seus produtos com dados verificados."
      features={[
        { name: "3.8M+ empresas", desc: "Base global de importadores verificados por capítulo HS." },
        { name: "Filtros por país e porte", desc: "Filtre por país, número de funcionários e faturamento." },
        { name: "Categoria de produto", desc: "Busque por categoria exata do produto importado." },
        { name: "Wizard interativo", desc: "Descreva seu produto, a IA sugere o HS e mostra os compradores." },
        { name: "Detalhes da empresa", desc: "Cidade, funcionários, categorias comercializadas e mais." },
        { name: "Exportação de resultados", desc: "Salve listas de leads em CSV para seu CRM." }
      ]}
      sections={[
        {
          title: "A maior base de importadores",
          content: "Nosso diretório cobre mais de 3.8 milhões de empresas importadoras em 97 países. Cada empresa é classificada por capítulo HS e categoria de produto, permitindo que você encontre exatamente quem compra o que você vende.",
          bullets: [
            "Dados verificados e atualizados periodicamente",
            "Cobertura global com foco em Américas, Europa e Ásia",
            "Filtros por porte da empresa (funcionários e faturamento)"
          ]
        },
        {
          title: "Para quem é?",
          content: "Exportadores brasileiros buscando compradores internacionais, consultores de comércio exterior, agências de promoção de exportação e empresas que querem diversificar mercados."
        }
      ]}
      ctaRoute="/importadores"
      relatedModules={[
        { label: "Classificador IA NCM", route: "/landing/ncm-classifier" },
        { label: "Tarifário Global", route: "/landing/tariff-calculator" },
        { label: "Smart Rank", route: "/landing/export-opportunities" }
      ]}
    />
  );
}
