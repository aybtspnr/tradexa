"use client";
import { Building2 } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CompanyGlobalProfileLanding() {
  return (
    <ModuleLandingTemplate
      icon={Building2}
      color="#8b5cf6"
      title="Perfil Global da Empresa"
      subtitle="Company Global Profile"
      heroDesc="Busque por CNPJ e veja o perfil completo da empresa: NCMs vinculados, parceiros comerciais, score de evidência e contexto global de mercado."
      seoTitle="Perfil Global da Empresa — Inteligência Comercial | TRADEXA"
      seoDescription="Consulte CNPJ com dados de comércio exterior e contexto global. Veja NCMs vinculados, parceiros, market share e indicadores."
      features={[
        { name: "Busca por CNPJ", desc: "Consulte qualquer empresa brasileira com atividade de comércio exterior." },
        { name: "NCMs vinculados", desc: "Veja todos os produtos que a empresa importa ou exporta." },
        { name: "Parceiros comerciais", desc: "Descubra países de origem/destino e principais fornecedores." },
        { name: "Contexto global", desc: "Indicadores macroeconômicos e market share do setor." },
        { name: "Score de evidência", desc: "Ranking baseado em volume e frequência de operações." },
        { name: "Exportação de dados", desc: "Baixe relatório completo em PDF." }
      ]}
      sections={[
        {
          title: "O que é o Perfil Global da Empresa",
          content: "O Perfil Global da Empresa consolida dados de comércio exterior de qualquer empresa brasileira em uma única página. Ao buscar por CNPJ, você tem acesso imediato aos NCMs vinculados à empresa, seus parceiros comerciais (países de origem e destino), score de evidência baseado no volume de operações e contexto macroeconômico do setor.",
          bullets: [
            "Consulta por CNPJ com resultados em segundos",
            "Dados integrados de importação e exportação",
            "Contexto global com indicadores BCB e World Bank",
            "Relatório exportável em PDF para apresentações"
          ]
        },
        {
          title: "Para profissionais de comércio exterior",
          content: "Ideal para importadores e exportadores que precisam conhecer seus concorrentes, fornecedores e parceiros comerciais. Com o Perfil Global, você avalia a relevância de uma empresa no mercado, identifica quais produtos ela movimenta e descobre oportunidades de negociação."
        },
        {
          title: "Como usar",
          content: "Digite o CNPJ (apenas números) da empresa desejada e clique em buscar. O sistema consulta automaticamente as bases de evidência e exibe o perfil completo. Você pode navegar pelos NCMs vinculados, ver detalhes de cada produto e acessar o contexto global do setor. Use o botão de exportação para gerar um relatório PDF."
        }
      ]}
      ctaRoute="/company-global-profile"
      relatedModules={[
        { label: "Radar de Concorrência", route: "/radar-concorrencia" },
        { label: "Comparador Global", route: "/global-trade-comparison" },
        { label: "NCM Global Dashboard", route: "/ncm-global-dashboard" }
      ]}
    />
  );
}
