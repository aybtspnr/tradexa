"use client";

import GenericServicePage from "./GenericServicePage";

export default function ApiDocsPage() {
  return (
    <GenericServicePage
      badge="API de Dados"
      title="Integre a TRADEXA ao Seu Sistema"
      description="Acesso programático aos dados de comércio exterior para integração em ERPs, CRMs e plataformas próprias."
      ctaRoute="/register?plan=max"
      ctaText="Solicitar Acesso API"
      features={[
        {"icon": "Database", "title": "REST API", "desc": "Endpoints JSON completos com autenticação via API key."},
        {"icon": "Search", "title": "Consulta Programática", "desc": "Busque NCMs, empresas e registros diretamente via código."},
        {"icon": "BarChart3", "title": "Dados em Tempo Real", "desc": "Acesso aos dados mais recentes assim que publicados."},
        {"icon": "FileText", "title": "Documentação", "desc": "Docs completos com exemplos em Python, JavaScript, PHP e cURL."},
        {"icon": "Shield", "title": "Segurança", "desc": "Autenticação OAuth2, rate limiting e criptografia TLS 1.3."},
        {"icon": "Globe", "title": "Webhooks", "desc": "Receba notificações push quando novos dados forem publicados."},
      ]}
      seoTitle="API de Comércio Exterior para Integração Empresarial"
      seoParagraphs={[
        "Empresas que trabalham com grandes volumes de dados de comércio exterior precisam de acesso programático. Nossa API REST permite integrar os dados da TRADEXA diretamente em ERPs, CRMs, plataformas de BI e sistemas próprios de análise.",
        "Os endpoints cobrem todas as funcionalidades da plataforma: consulta de NCM/HS/HTS, busca de registros de importação/exportação, estatísticas agregadas, mapas geográficos e alertas. A documentação inclui exemplos prontos em Python, JavaScript, PHP e cURL.",
        "Disponível exclusivamente no plano Max, a API oferece autenticação segura via OAuth2, rate limiting generoso e webhooks para notificações em tempo real. Ideal para empresas de consultoria, fintechs de trade finance e grandes trading companies.",
      ]}
    />
  );
}
