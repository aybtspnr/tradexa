"use client";

import GenericServicePage from "./GenericServicePage";

export default function MarketAnalysisPage() {
  return (
    <GenericServicePage
      badge="Análise de Mercado"
      title="Dados Cruzados Brasil ↔ Mundo"
      description="Compare dados nacionais e internacionais para identificar oportunidades, tendências e gaps de mercado."
      ctaRoute="/trade-intelligence"
      ctaText="Análise de Mercado"
      features={[
        {"icon": "Scale", "title": "Brasil ↔ EUA", "desc": "Cruze dados brasileiros e americanos para visão bilateral."},
        {"icon": "BarChart3", "title": "Balança Comercial", "desc": "Analise saldo comercial por produto, país e período."},
        {"icon": "Target", "title": "Inteligência Competitiva", "desc": "Monitore concorrentes e sua evolução no mercado."},
        {"icon": "Globe", "title": "Dados Globais", "desc": "Bases internacionais para visão mundial."},
        {"icon": "Newspaper", "title": "Notícias do Setor", "desc": "Mudanças tarifárias, acordos comerciais e regulamentações."},
        {"icon": "FileText", "title": "Relatórios", "desc": "Análises profundas em formato apresentável para clientes."},
      ]}
      seoTitle="Análise de Mercado com Dados Cruzados Internacionais"
      seoParagraphs={[
        "Compreender o mercado de comércio exterior exige visão ampla. A TRADEXA cruza dados nacionais com bases internacionais, oferecendo uma perspectiva única do posicionamento brasileiro no comércio global.",
        "A análise de Balança Comercial permite identificar produtos com déficit crônico (oportunidades de substituição de importações) e produtos com superávit crescente (oportunidades de ampliação de exportações). Tudo filtrável por país, período e classificação.",
        "Nossa Inteligência Competitiva monitora os principais players de cada setor, mostrando evolução de market share, novos entrantes e saídas de mercado. Ideal para planejamento estratégico, apresentações a investidores e tomada de decisão de alta direção.",
      ]}
    />
  );
}
