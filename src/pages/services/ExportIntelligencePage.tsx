"use client";

import GenericServicePage from "./GenericServicePage";

export default function ExportIntelligencePage() {
  return (
    <GenericServicePage
      badge="Inteligência de Exportação"
      title="Descubra Onde Exportar"
      description="Identifique mercados crescentes, concorrentes globais e oportunidades de expansão internacional com dados atualizados."
      ctaRoute="/export-intelligence"
      ctaText="Acessar Dashboard"
      features={[
        {"icon": "Database", "title": "Dados Oficiais", "desc": "Registros de exportação com destino, produto e valor."},
        {"icon": "Search", "title": "Busca por Destino", "desc": "Encontre os principais compradores de cada produto por país."},
        {"icon": "BarChart3", "title": "Tendências", "desc": "Analise crescimento de mercados e sazonalidade por produto."},
        {"icon": "MapPin", "title": "Mapa Global", "desc": "Visualize para onde o Brasil exporta cada produto no mundo."},
        {"icon": "Target", "title": "Oportunidades", "desc": "Descubra mercados em crescimento com poucos competidores."},
        {"icon": "Globe", "title": "Guia de Entrada", "desc": "Requisitos, tarifas e regulamentações por país de destino."},
      ]}
      seoTitle="Inteligência de Exportação: Encontre Novos Mercados"
      seoParagraphs={[
        "A exportação brasileira atinge mais de 190 países anualmente. A TRADEXA mapeia cada operação, permitindo que empresas identifiquem mercados em crescimento, entendam a concorrência e planejem estratégias de expansão com base em dados concretos.",
        "Nosso Ranking de Exportadores mostra quem são os maiores players de cada produto, enquanto o Mapa Global revela oportunidades geográficas que passam despercebidas em análises tradicionais. O Guia de Entrada complementa com informações práticas sobre regulamentações de cada país.",
        "Para produtores e trading companies, saber quais mercados cresceram 30% no último ano e quais têm poucos competidores brasileiros é informação valiosa. Nossos alertas de oportunidades notificam automaticamente quando um novo mercado se mostra promissor.",
      ]}
    />
  );
}
