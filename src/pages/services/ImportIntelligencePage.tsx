"use client";

import GenericServicePage from "./GenericServicePage";

export default function ImportIntelligencePage() {
  return (
    <GenericServicePage
      badge="Inteligência de Importação"
      title="Descubra Quem Importa no Brasil"
      description="Acesse dados atualizados de importação brasileira. Identifique fornecedores, volumes, preços médios e tendências de mercado em tempo real."
      ctaRoute="/import-intelligence"
      ctaText="Acessar Dashboard"
      features={[
        {"icon": "Database", "title": "Dados Oficiais", "desc": "Registros atualizados mensalmente com CNPJ, NCM, valor e origem."},
        {"icon": "Search", "title": "Busca Avançada", "desc": "Filtre por produto, empresa, país de origem, período e valor."},
        {"icon": "BarChart3", "title": "Estatísticas", "desc": "Veja evolução temporal, preços médios e participação de mercado."},
        {"icon": "MapPin", "title": "Mapa de Calor", "desc": "Visualize geograficamente onde cada produto é mais importado."},
        {"icon": "BellRing", "title": "Alertas", "desc": "Receba notificações quando novos importadores aparecerem."},
        {"icon": "FileText", "title": "Relatórios", "desc": "Exporte análises em PDF ou Excel para apresentações."},
      ]}
      seoTitle="Inteligência de Importação com Dados Oficiais Brasileiros"
      seoParagraphs={[
        "O mercado de importação brasileiro movimenta bilhões de dólares anualmente. Com a TRADEXA, você acessa cada registro individual de importação — CNPJ do importador, produto (NCM), país de origem, valor FOB, frete, seguro e peso líquido. Todos os dados são oficiais, verificáveis e atualizados mensalmente.",
        "Nosso dashboard permite identificar rapidamente quem são os maiores importadores de um determinado produto, quais países dominam o fornecimento, e como os preços evoluíram ao longo do tempo. Isso é essencial para empresas que buscam fornecedores alternativos e consultores tarifários que validam classificações.",
        "A funcionalidade de Mapa de Calor mostra geograficamente onde cada produto é mais importado no Brasil, permitindo identificar hubs logísticos e oportunidades regionais. Com alertas automáticos, você é notificado quando novos importadores aparecem ou quando volumes mudam significativamente.",
      ]}
    />
  );
}
