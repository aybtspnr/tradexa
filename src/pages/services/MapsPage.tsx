"use client";

import GenericServicePage from "./GenericServicePage";

export default function MapsPage() {
  return (
    <GenericServicePage
      badge="Mapas e Visualizações"
      title="Veja o Comércio Exterior no Mapa"
      description="Visualize rotas, volumes e tendências em mapas interativos de alta performance e gráficos dinâmicos."
      ctaRoute="/import-intelligence/map"
      ctaText="Ver Mapa"
      features={[
        {"icon": "MapPin", "title": "Mapa de Calor", "desc": "Intensidade de importação/exportação por município brasileiro."},
        {"icon": "Globe", "title": "Mapa Global", "desc": "Para onde o Brasil exporta e de onde importa cada produto."},
        {"icon": "Route", "title": "Roteamento", "desc": "Rotas marítimas e aéreas com portos e aeroportos principais."},
        {"icon": "BarChart3", "title": "Gráficos 3D", "desc": "Visualizações imersivas de dados temporais e comparativos."},
        {"icon": "Truck", "title": "Logística", "desc": "Análise de cadeias de suprimentos e gargalos de transporte."},
        {"icon": "FileText", "title": "Análise Visual", "desc": "Mapas e gráficos interativos para apresentações e análises."},
      ]}
      seoTitle="Mapas Interativos para Análise Geográfica de Comércio Exterior"
      seoParagraphs={[
        "A geolocalização dos dados de comércio exterior revela padrões que tabelas e números não conseguem mostrar. Com nossos mapas interativos, você visualiza onde cada produto é concentrado, identifica corredores logísticos e descobre oportunidades regionais.",
        "O Mapa de Calor de Importação mostra os municípios brasileiros com maior volume de importação por NCM. Ideal para empresas de logística que buscam novos clientes, e para importadores que querem entender onde seus concorrentes estão concentrados.",
        "O Mapa Global cruza dados brasileiros com bases internacionais, mostrando rotas de comércio, portos mais utilizados e hubs de distribuição. Combine com o Roteamento para otimizar cadeias de suprimentos e reduzir custos logísticos.",
      ]}
    />
  );
}
