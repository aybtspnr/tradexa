"use client";

import GenericServicePage from "./GenericServicePage";

export default function ToolsPage() {
  return (
    <GenericServicePage
      badge="Ferramentas de Comércio"
      title="Utilitários para Operações Internacionais"
      description="Calculadoras, simuladores e buscadores inteligentes para reduzir custos e agilizar suas operações de comércio exterior."
      ctaRoute="/hts-lookup"
      ctaText="Consultar NCM/HS"
      features={[
        {"icon": "Search", "title": "Consulta NCM/HS/HTS", "desc": "Busque por produto, código ou descrição com informações completas de impostos."},
        {"icon": "Percent", "title": "Simulador de Impostos", "desc": "Calcule II, IPI, PIS, COFINS e ICMS para qualquer operação."},
        {"icon": "Truck", "title": "Calculadora de Frete", "desc": "Estime custos logísticos por modalidade e rota internacional."},
        {"icon": "Route", "title": "Otimizador de Rotas", "desc": "Encontre a melhor rota considerando tempo, custo e risco."},
        {"icon": "Scale", "title": "Arbitragem de Preços", "desc": "Compare preços do mesmo produto em diferentes mercados."},
        {"icon": "Bot", "title": "Classificador IA", "desc": "Descreva o produto e receba o código NCM/HS mais adequado."},
      ]}
      seoTitle="Ferramentas Completas para Comércio Exterior"
      seoParagraphs={[
        "O comércio exterior envolve dezenas de variáveis: classificação fiscal, impostos, frete, seguro, cambio, documentação. Nossas ferramentas automatizam cálculos que normalmente levam horas, reduzindo erros e custos operacionais.",
        "O Classificador com IA é revolucionário: descreva 'resina epóxi para revestimento industrial' e receba instantaneamente o NCM correto, com alíquotas de importação e exportação, restrições e legislação aplicável. Sem precisar consultar manuais extensos.",
        "O Simulador de Impostos permite calcular o custo total de importação antes de fechar negócio, incluindo todos os tributos federais e estaduais. A Calculadora de Frete compara modalidades e apresenta a opção mais econômica para cada cenário.",
      ]}
    />
  );
}
