"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Globe, BarChart3, TrendingUp, Map, Database,
  Ship, BellRing, ArrowRight, Radio, Navigation,
  Brain, Calculator, Shield, FileText,
  Briefcase, Users, Truck, PackageCheck, Building2, SearchCheck, ClipboardCheck,
} from "lucide-react";
import { ExpandableModuleCard } from "./ExpandableModuleCard";

interface ExpandedModule {
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  longDesc: string;
  features: { name: string; desc: string }[];
  color: string;
  actionRoute: string;
  landingRoute: string;
  actionLabel?: string;
  moreInfoLabel?: string;
  badge?: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  titulo: string;
  descricao: string;
  ctaTexto: string;
  ctaRota: string;
  modulos: ExpandedModule[];
}

const CATEGORIES: Category[] = [
  {
    id: "inteligencia",
    icon: Brain,
    titulo: "Inteligência de Mercado",
    descricao: "Dados reais, análises e rankings para decisões estratégicas",
    ctaTexto: "Explorar Inteligência",
    ctaRota: "/register",
    modulos: [
      {
        icon: BarChart3, title: "Trade Intelligence",
        shortDesc: "Dados de importação e exportação",
        longDesc: "Dashboard completo com registros de comércio exterior: volumes, valores, preços médios, fornecedores, países de origem/destino. Filtros por NCM, período e estado.",
        features: [
          { name: "Dados completos", desc: "Registros verificáveis de comércio exterior" },
          { name: "Filtros avançados", desc: "NCM, país, estado, porto, período" },
          { name: "Exportação", desc: "CSV e Excel com um clique" },
        ],
        color: "#10b981",
        actionRoute: "/trade-intelligence",
        landingRoute: "/landing/import-dashboard",
      },
      {
        icon: TrendingUp, title: "Market Intelligence",
        shortDesc: "Análise competitiva com dados cruzados de mercado",
        longDesc: "Análise completa de inteligência de mercado com dados cruzados de importação, exportação e indicadores. Insights de IA para tomada de decisão estratégica.",
        features: [
          { name: "Dados cruzados", desc: "Importação + Exportação + Global" },
          { name: "IA analítica", desc: "Insights automáticos por IA" },
          { name: "Indicadores", desc: "Market share, preços médios, tendências" },
        ],
        color: "#D80E16",
        actionRoute: "/trade-intelligence",
        landingRoute: "/landing/market-intelligence",
      },
      {
        icon: TrendingUp, title: "Smart Rank",
        shortDesc: "Ranking de países por oportunidade de mercado",
        longDesc: "Compare países por potencial de exportação usando tarifas, demanda, logística e competitividade. Identifique os melhores mercados para cada produto.",
        features: [
          { name: "Score automático", desc: "Tarifa + Demanda + Frete + Facilidade" },
          { name: "Comparação lado a lado", desc: "Até 5 países simultaneamente" },
          { name: "Pontuação combinada", desc: "Múltiplos fatores em um score único" },
        ],
        color: "#8b5cf6",
        actionRoute: "/smart-rank",
        landingRoute: "/landing/export-opportunities",
      },
      {
        icon: Globe, title: "Explorador Global",
        shortDesc: "Rotas de comércio exterior em mapa interativo",
        longDesc: "Visualize rotas de comércio exterior brasileiro em mapa interativo. Dados bilaterais completos, balança comercial e indicadores macroeconômicos.",
        features: [
          { name: "Mapa interativo", desc: "Rotas comerciais bilaterais" },
          { name: "Balança comercial", desc: "Exportação e importação por país" },
          { name: "Indicadores", desc: "PIB, população, acordos comerciais" },
        ],
        color: "#06b6d4",
        actionRoute: "/country-comparison",
        landingRoute: "/landing/global-explorer",
      },
      {
        icon: Map, title: "Mapa de Importadores",
        shortDesc: "Geolocalização de operações de comércio exterior",
        longDesc: "Visualize em mapa interativo a distribuição geográfica das importações. Clique em qualquer país ou município para ver detalhes de operações.",
        features: [
          { name: "Mapa interativo", desc: "Visualização global de operações" },
          { name: "Drill-down", desc: "Dados detalhados por país/cidade" },
          { name: "Filtros por NCM", desc: "Veja fluxos de produtos específicos" },
        ],
        color: "#06b6d4",
        actionRoute: "/importers-map",
        actionLabel: "Ver Mapa",
        landingRoute: "/landing/import-map",
      },
      {
        icon: Database, title: "Diretório de Importadores",
        shortDesc: "Milhões de empresas importadoras por código HS",
        longDesc: "Acesse o diretório de importadores mundiais classificados por capítulo HS. Filtre por país, porte e categoria de produto para encontrar leads qualificados.",
        features: [
          { name: "3.8M+ empresas", desc: "Base global por código HS" },
          { name: "Filtros avançados", desc: "País, porte, categoria de produto" },
          { name: "Wizard interativo", desc: "Busca guiada passo a passo" },
        ],
        color: "#ef4444",
        actionRoute: "/importadores",
        landingRoute: "/landing/importadores",
      },
      {
        icon: Search, title: "Busca de Importadores",
        shortDesc: "Busca inteligente de importadores por NCM",
        longDesc: "Encontre importadores brasileiros por NCM, produto ou empresa. Busca inteligente com filtros por país, estado, porto e período.",
        features: [
          { name: "Busca inteligente", desc: "Por NCM, produto ou empresa" },
          { name: "Filtros avançados", desc: "País, estado, porto, período" },
          { name: "Resultados detalhados", desc: "Volumes, valores, frequência" },
        ],
        color: "#8b5cf6",
        actionRoute: "/importadores",
        landingRoute: "/landing/import-search",
      },
      {
        icon: TrendingUp, title: "Arbitragem de Preços",
        shortDesc: "Compare preços entre 130+ países",
        longDesc: "Compare preços de produtos entre mais de 130 países e descubra oportunidades de arbitragem com margens reais calculadas automaticamente.",
        features: [
          { name: "130+ países", desc: "Comparação global de preços" },
          { name: "Margens reais", desc: "Cálculo automático de margem" },
          { name: "Alertas", desc: "Notificação de oportunidades" },
        ],
        color: "#f59e0b",
        actionRoute: "/smart-rank",
        landingRoute: "/landing/price-arbitrage",
      },
      {
        icon: TrendingUp, title: "Dashboard de Exportação",
        shortDesc: "Dados brasileiros de exportação por produto e destino",
        longDesc: "Acompanhe exportações brasileiras por produto, destino e período. Dashboards interativos com market share, preços médios e sazonalidade.",
        features: [
          { name: "Produtos e destinos", desc: "Exportação por NCM e país" },
          { name: "Market share", desc: "Participação do Brasil no mundo" },
          { name: "Sazonalidade", desc: "Tendências ao longo do ano" },
        ],
        color: "#10b981",
        actionRoute: "/export-intelligence",
        landingRoute: "/landing/export-dashboard",
      },
    ],
  },
  {
    id: "classificacao",
    icon: Search,
    titulo: "Classificação e Tarifas",
    descricao: "Classifique produtos e consulte tarifas em 31 países",
    ctaTexto: "Consultar Tarifas",
    ctaRota: "/global-tariff",
    modulos: [
      {
        icon: Search, title: "Classificador IA NCM",
        shortDesc: "Classificação automática de produtos por linguagem natural",
        longDesc: "Descreva qualquer produto em português e receba o código NCM, HS e HTS correspondente em segundos. Com alíquotas de imposto, descrições completas e restrições aplicáveis.",
        features: [
          { name: "Linguagem natural", desc: "Descreva o produto com suas palavras" },
          { name: "NCM + HS + HTS", desc: "Classificação tripla automática" },
          { name: "Alíquotas completas", desc: "II, IPI, PIS, COFINS, ICMS por estado" },
        ],
        color: "#D80E16",
        actionRoute: "/ai-search",
        landingRoute: "/landing/ncm-classifier",
      },
      {
        icon: Globe, title: "Tarifário Global",
        shortDesc: "Alíquotas de importação em 31 países",
        longDesc: "Consulte tarifas de importação para qualquer produto em 31 mercados. Compare alíquotas entre países, veja VAT e simule cenários de custo total.",
        features: [
          { name: "31 países", desc: "Brasil, EUA, UE, China e mais" },
          { name: "Alíquotas completas", desc: "Tarifas e VAT por NCM/HS" },
          { name: "Simulador", desc: "Calcule custo total de importação" },
        ],
        color: "#f59e0b",
        actionRoute: "/global-tariff",
        landingRoute: "/landing/tariff-calculator",
      },
      {
        icon: Database, title: "Lista NCM Completa",
        shortDesc: "Busca por código ou descrição na tabela NCM",
        longDesc: "Lista completa de códigos NCM com busca por código ou descrição. Classificação fiscal com alíquotas e regulamentações atualizadas.",
        features: [
          { name: "Busca completa", desc: "Por código NCM ou descrição" },
          { name: "Alíquotas", desc: "Impostos por código NCM" },
          { name: "Atualizada", desc: "Tabela NCM vigente 2026" },
        ],
        color: "#06b6d4",
        actionRoute: "/landing/lista-ncm",
        landingRoute: "/landing/lista-ncm",
      },
      {
        icon: TrendingUp, title: "Calculadora de Impostos",
        shortDesc: "Simule II, IPI, PIS, COFINS e ICMS por estado",
        longDesc: "Calculadora completa de tributos de importação. Simule todos os impostos por estado brasileiro e veja o custo total da sua importação antes de comprar.",
        features: [
          { name: "Todos os tributos", desc: "II + IPI + PIS + COFINS + ICMS" },
          { name: "Por estado", desc: "Alíquotas de ICMS de cada UF" },
          { name: "Custo total", desc: "Valor final incluindo todos os tributos" },
        ],
        color: "#10b981",
        actionRoute: "/global-tariff",
        landingRoute: "/landing/calculadora-importacao",
      },
      {
        icon: BellRing, title: "Alertas de Tarifas",
        shortDesc: "Notificações de mudanças e oportunidades",
        longDesc: "Configure alertas para ser notificado sobre mudanças de alíquotas, novos importadores e tendências de mercado. Receba por email.",
        features: [
          { name: "Alertas de mercado", desc: "Novos players e tendências" },
          { name: "Alertas tarifários", desc: "Mudanças de alíquotas" },
          { name: "Notificações", desc: "Email e dashboard em tempo real" },
        ],
        color: "#D80E16",
        actionRoute: "/tariff-alerts",
        landingRoute: "/landing/smart-alerts",
      },
    ],
  },
  {
    id: "logistica",
    icon: Ship,
    titulo: "Logística e Rastreamento",
    descricao: "Acompanhe cargas em tempo real e compare rotas e portos",
    ctaTexto: "Rastrear Carga",
    ctaRota: "/track-trace",
    modulos: [
      {
        icon: Radio, title: "Supply Chain Map",
        shortDesc: "Mapa logístico global ao vivo — navios, aviões e portos",
        longDesc: "Acompanhe em tempo real milhares de navios de carga, aviões cargueiros, portos e aeroportos do mundo inteiro. Dados ao vivo de AIS (navios) e ADS-B (aviões). Ferramenta gratuita e aberta.",
        features: [
          { name: "Navios ao vivo", desc: "12.500+ navios rastreados via AIS em tempo real" },
          { name: "Aviões de carga", desc: "Aviões cargueiros rastreados via ADS-B" },
          { name: "Infraestrutura global", desc: "5.200+ aeroportos, 3.600+ portos, chokepoints" },
        ],
        color: "#D80E16",
        actionRoute: "/supply-chain",
        landingRoute: "/landing/supply-chain",
        badge: "Novo",
      },
      {
        icon: Navigation, title: "Track & Trace",
        shortDesc: "Navios e aviões cargueiros ao vivo no mapa mundial",
        longDesc: "Rastreamento em tempo real de milhares de navios de carga e aviões cargueiros com dados AIS (satélite) e ADS-B (aviação). Veja posição, velocidade, destino e ETA de cada embarcação e aeronave no mapa mundial interativo.",
        features: [
          { name: "Navios ao vivo", desc: "Milhares de navios rastreados via satélite AIS" },
          { name: "Aviões cargueiros", desc: "Voos de carga monitorados via ADS-B" },
          { name: "Busca inteligente", desc: "Encontre por nome, callsign, MMSI ou ICAO24" },
        ],
        color: "#D80E16",
        actionRoute: "/track-trace",
        landingRoute: "/landing/track-trace",
        badge: "Novo",
      },
      {
        icon: Ship, title: "Mapa de Frete Marítimo",
        shortDesc: "Rotas e cotações interativas no globo 3D",
        longDesc: "Mapa 3D interativo com rotas marítimas reais entre portos do mundo. Preços atualizados pelo World Container Index (WCI). Clique nos portos, compare cotações e solicite preços diretamente no mapa.",
        features: [
          { name: "Mapa 3D interativo", desc: "Globo terrestre com rotas e navios animados" },
          { name: "Preços indexados", desc: "Cotações ajustadas pelo World Container Index" },
          { name: "Cotação sob demanda", desc: "Solicite preços atualizados por email" },
        ],
        color: "#D80E16",
        actionRoute: "/maritime-freight-map",
        landingRoute: "/landing/maritime-freight-map",
        badge: "Beta",
      },
      {
        icon: Ship, title: "Frete Marítimo FCL",
        shortDesc: "Cotações de container entre portos do mundo",
        longDesc: "Compare cotações de frete marítimo FCL e LCL entre os principais portos do mundo. Preços de container 20 e 40 pés com taxas portuárias inclusas.",
        features: [
          { name: "FCL e LCL", desc: "Container completo ou carga consolidada" },
          { name: "Cotações reais", desc: "Preços atualizados com taxas inclusas" },
          { name: "Multi-rotas", desc: "Compare entre múltiplas rotas marítimas" },
        ],
        color: "#0ea5e9",
        actionRoute: "/maritime-freight-map",
        landingRoute: "/landing/maritime-freight-map",
      },
      {
        icon: Ship, title: "Rastreamento de Carga",
        shortDesc: "Rastreie containers e cargas express",
        longDesc: "Rastreamento gratuito de containers marítimos e cargas express. Suporte a DHL, FedEx, UPS, Maersk, ZIM e mais transportadoras.",
        features: [
          { name: "Múltiplas transportadoras", desc: "DHL, FedEx, UPS, Maersk, ZIM" },
          { name: "Gratuito", desc: "Sem necessidade de cadastro" },
          { name: "Tempo real", desc: "Status atualizado da sua carga" },
        ],
        color: "#D80E16",
        actionRoute: "/track-trace",
        landingRoute: "/landing/rastreamento",
        badge: "Gratuito",
      },
      {
        icon: Map, title: "Comparador de Portos",
        shortDesc: "Compare custos, prazos e eficiência entre portos",
        longDesc: "Compare os principais portos brasileiros lado a lado: custo médio por container, tempo de desembaraço, taxas portuárias e eficiência operacional.",
        features: [
          { name: "Custos detalhados", desc: "Taxas portuárias por container" },
          { name: "Prazos", desc: "Tempo médio de desembaraço" },
          { name: "Eficiência", desc: "Indicadores operacionais por porto" },
        ],
        color: "#f59e0b",
        actionRoute: "/ferramentas/comparador-portos",
        landingRoute: "/landing/comparador-portos",
      },
    ],
  },
  {
    id: "calculadoras",
    icon: Calculator,
    titulo: "Calculadoras e Ferramentas",
    descricao: "Simule custos, gere documentos e garanta conformidade",
    ctaTexto: "Ver Todas as Ferramentas",
    ctaRota: "/ferramentas",
    modulos: [
      {
        icon: TrendingUp, title: "Calculadora Incoterms",
        shortDesc: "Compare responsabilidades dos 11 Incoterms",
        longDesc: "Simule e compare todos os 11 Incoterms 2020: EXW, FOB, CIF, DDP. Veja quem paga frete, seguro e desembaraço em cada termo.",
        features: [
          { name: "11 Incoterms", desc: "Todos os termos de 2020" },
          { name: "Comparação", desc: "Lado a lado: custos e responsabilidades" },
          { name: "Simulação", desc: "Calcule valores para cada termo" },
        ],
        color: "#8b5cf6",
        actionRoute: "/ferramentas/calculadora-incoterms",
        landingRoute: "/landing/calculadora-incoterms",
      },
      {
        icon: TrendingUp, title: "Calculadora de Drawback",
        shortDesc: "Simule a suspensão de tributos na exportação",
        longDesc: "Calcule quanto você economiza com o regime de drawback. Simule suspensão de II, IPI, PIS e COFINS para insumos usados em produtos exportados.",
        features: [
          { name: "Economia real", desc: "Quanto você deixa de pagar" },
          { name: "Suspensão total", desc: "II + IPI + PIS + COFINS" },
          { name: "Simulação rápida", desc: "Resultado em segundos" },
        ],
        color: "#D80E16",
        actionRoute: "/ferramentas/calculadora-drawback",
        landingRoute: "/landing/calculadora-drawback",
      },
      {
        icon: TrendingUp, title: "Calculadora ACC/ACE",
        shortDesc: "Financiamento à exportação",
        longDesc: "Simule o Adiantamento sobre Contrato de Câmbio (ACC) e Adiantamento sobre Cambiais Entregues (ACE) para financiar sua exportação.",
        features: [
          { name: "ACC e ACE", desc: "Compare as duas modalidades" },
          { name: "Custos", desc: "Taxas, juros e spread cambial" },
          { name: "Prazos", desc: "Antecipação de até 360 dias" },
        ],
        color: "#f59e0b",
        actionRoute: "/ferramentas/calculadora-acc-ace",
        landingRoute: "/landing/calculadora-acc-ace",
      },
      {
        icon: TrendingUp, title: "Precificação de Exportação",
        shortDesc: "Calcule o preço final no mercado de destino",
        longDesc: "Simule todos os custos de exportação: frete internacional, seguro de carga, impostos no destino e taxas portuárias para chegar ao preço final.",
        features: [
          { name: "Custos completos", desc: "Frete + seguro + impostos + taxas" },
          { name: "Preço final", desc: "Valor de venda no mercado destino" },
          { name: "Margem", desc: "Calcule sua margem de lucro" },
        ],
        color: "#10b981",
        actionRoute: "/ferramentas/precificacao-exportacao",
        landingRoute: "/landing/precificacao-exportacao",
      },
      {
        icon: TrendingUp, title: "Calculadora de Carbono",
        shortDesc: "Pegada de carbono na logística internacional",
        longDesc: "Calcule a pegada de carbono da sua cadeia logística. Compare emissões entre modais de transporte para ESG e sustentabilidade.",
        features: [
          { name: "Emissões CO2", desc: "Cálculo por modal de transporte" },
          { name: "Comparação", desc: "Marítimo vs aéreo vs rodoviário" },
          { name: "Relatório", desc: "Dados para ESG e sustentabilidade" },
        ],
        color: "#10b981",
        actionRoute: "/ferramentas/calculadora-carbono",
        landingRoute: "/landing/calculadora-carbono",
      },
      {
        icon: TrendingUp, title: "Simulador de Acordos Comerciais",
        shortDesc: "Impacto de acordos nas tarifas",
        longDesc: "Simule o impacto de acordos comerciais (Mercosul, ALADI, SGP) nas alíquotas de importação. Veja quanto você economiza com preferências tarifárias.",
        features: [
          { name: "Acordos reais", desc: "Mercosul, ALADI, SGP e mais" },
          { name: "Margem de preferência", desc: "Redução tarifária aplicável" },
          { name: "Simulação", desc: "Compare com e sem acordo" },
        ],
        color: "#8b5cf6",
        actionRoute: "/ferramentas/simulador-acordos-comerciais",
        landingRoute: "/landing/simulador-acordos-comerciais",
      },
      {
        icon: FileText, title: "Gerador de Documentos",
        shortDesc: "DI, LI e documentos aduaneiros",
        longDesc: "Gere documentos de importação e exportação: Declaração de Importação, Licença de Importação, Nota de Compra e mais. Exporte em PDF.",
        features: [
          { name: "DI e LI", desc: "Declaração e Licença de Importação" },
          { name: "Automático", desc: "Preenchimento automático de campos" },
          { name: "PDF", desc: "Documento pronto para impressão" },
        ],
        color: "#10b981",
        actionRoute: "/ferramentas/gerador-documentos",
        landingRoute: "/landing/gerador-documentos",
      },
      {
        icon: Shield, title: "Conformidade Regulatória",
        shortDesc: "ANVISA, INMETRO e órgãos reguladores",
        longDesc: "Consulte as regulamentações aplicáveis ao seu produto: ANVISA, INMETRO, MAPA e IBAMA. Saiba quais certificações são obrigatórias para importar.",
        features: [
          { name: "ANVISA", desc: "Produtos de saúde e cosméticos" },
          { name: "INMETRO", desc: "Segurança e certificação" },
          { name: "MAPA/IBAMA", desc: "Alimentos e meio ambiente" },
        ],
        color: "#D80E16",
        actionRoute: "/ferramentas/conformidade-regulatoria",
        landingRoute: "/landing/conformidade-regulatoria",
      },
      {
        icon: TrendingUp, title: "Wizard de Exportação",
        shortDesc: "Guia passo a passo para novos exportadores",
        longDesc: "Do zero à primeira venda internacional: classificação de produtos, documentação, match com compradores, simulação financeira e compliance.",
        features: [
          { name: "Passo a passo", desc: "Guia completo para iniciantes" },
          { name: "Documentação", desc: "Lista de documentos por país" },
          { name: "Match compradores", desc: "Encontre importadores para seu produto" },
        ],
        color: "#8b5cf6",
        actionRoute: "/export-wizard",
        landingRoute: "/landing/export-wizard",
      },
    ],
  },
  {
    id: "consultoria",
    icon: Briefcase,
    titulo: "Consultoria",
    descricao: "Serviços especializados para sua operação de comércio exterior",
    ctaTexto: "Falar com Especialista",
    ctaRota: "/contact",
    modulos: [
      {
        icon: TrendingUp, title: "Pesquisa de Mercado para Exportação",
        shortDesc: "Análise de viabilidade e potencial de mercados-alvo",
        longDesc: "Pesquisa completa de mercado para seu produto em países selecionados: tamanho do mercado, concorrência, barreiras tarifárias e regulatórias, canais de distribuição e potencial de vendas.",
        features: [
          { name: "Análise de mercado", desc: "Tamanho, crescimento e tendências" },
          { name: "Concorrência", desc: "Players locais e internacionais" },
          { name: "Barreiras", desc: "Tarifárias, regulatórias e logísticas" },
        ],
        color: "#D80E16",
        actionRoute: "/servicos/pesquisa-mercado-exportacao",
        landingRoute: "/servicos/pesquisa-mercado-exportacao",
      },
      {
        icon: Users, title: "Pesquisa de Compradores Internacionais",
        shortDesc: "Identificação de compradores qualificados no exterior",
        longDesc: "Encontramos compradores reais para seu produto em mercados internacionais. Perfil completo da empresa, histórico de importação, porte e canais de contato direto.",
        features: [
          { name: "Compradores reais", desc: "Empresas que já importam produtos similares" },
          { name: "Perfil completo", desc: "Porte, canais, histórico de importação" },
          { name: "Contato direto", desc: "Nome, email e telefone do decision maker" },
        ],
        color: "#D80E16",
        actionRoute: "/servicos/pesquisa-compradores",
        landingRoute: "/servicos/pesquisa-compradores",
      },
      {
        icon: Truck, title: "Cotação de Frete Internacional",
        shortDesc: "Cotações comparativas entre transportadoras",
        longDesc: "Receba cotações de frete marítimo, aéreo e rodoviário das principais transportadoras. Comparamos preços, prazos e rotas para sua carga específica.",
        features: [
          { name: "Multi-transportadoras", desc: "Cotações de 5+ empresas" },
          { name: "Todos os modais", desc: "Marítimo, aéreo e rodoviário" },
          { name: "Comparativo", desc: "Preço, prazo e rota lado a lado" },
        ],
        color: "#0ea5e9",
        actionRoute: "/servicos/cotacao-frete-internacional",
        landingRoute: "/servicos/cotacao-frete-internacional",
      },
      {
        icon: ClipboardCheck, title: "Despacho Aduaneiro",
        shortDesc: "Assessoria completa para liberação alfandegária",
        longDesc: "Cuidamos de todo o processo de desembaraço aduaneiro: classificação fiscal, cálculo de tributos, registro da DI, licenças e acompanhamento até a liberação.",
        features: [
          { name: "Processo completo", desc: "Da classificação à liberação" },
          { name: "Especialistas", desc: "Despachantes experientes por setor" },
          { name: "Conformidade", desc: "100% em conformidade com a Receita Federal" },
        ],
        color: "#f59e0b",
        actionRoute: "/servicos/despacho-aduaneiro",
        landingRoute: "/servicos/despacho-aduaneiro",
      },
      {
        icon: PackageCheck, title: "Fulfillment Internacional",
        shortDesc: "Armazenagem, picking, packing e envio global",
        longDesc: "Serviço completo de fulfillment: recebemos, armazenamos, preparamos e enviamos seus pedidos para qualquer lugar do mundo. Ideal para e-commerce cross-border.",
        features: [
          { name: "Armazenagem", desc: "Centros logísticos no Brasil e exterior" },
          { name: "Picking & packing", desc: "Separação e embalagem profissional" },
          { name: "Envio global", desc: "Integração com principais transportadoras" },
        ],
        color: "#10b981",
        actionRoute: "/servicos/fulfillment",
        landingRoute: "/servicos/fulfillment",
      },
      {
        icon: Building2, title: "Representação Comercial no Brasil",
        shortDesc: "Seu representante legal para operar no Brasil",
        longDesc: "Atuamos como seu representante comercial e legal no Brasil. Importação por conta e ordem, representação junto à Receita Federal e suporte regulatório completo.",
        features: [
          { name: "Representação legal", desc: "Importação por conta e ordem" },
          { name: "Suporte regulatório", desc: "ANVISA, INMETRO, MAPA e mais" },
          { name: "Operação completa", desc: "Do fornecedor ao cliente final" },
        ],
        color: "#8b5cf6",
        actionRoute: "/servicos/representacao-brasil",
        landingRoute: "/servicos/representacao-brasil",
      },
      {
        icon: SearchCheck, title: "Auditoria de Classificação Fiscal",
        shortDesc: "Revisão de NCM e otimização tributária",
        longDesc: "Auditamos a classificação fiscal dos seus produtos para identificar erros de NCM, oportunidades de redução tributária e riscos de autuação pela Receita Federal.",
        features: [
          { name: "Revisão completa", desc: "Análise de todos os NCMs da sua operação" },
          { name: "Otimização", desc: "Identificação de NCMs com alíquotas menores" },
          { name: "Relatório", desc: "Diagnóstico com recomendações e economia projetada" },
        ],
        color: "#D80E16",
        actionRoute: "/servicos/auditoria-classificacao-fiscal",
        landingRoute: "/servicos/auditoria-classificacao-fiscal",
      },
    ],
  },
];

export function PlatformModulesSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] overflow-hidden">
      {/* Mesh bg */}
      <div className="absolute inset-0 opacity-40 mesh-cream" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            Módulos da Plataforma
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-5">
            Tudo que você precisa para{" "}
            <span className="text-[#D80E16]">dominar</span>
            {" "}o comércio exterior
          </h2>
          <p className="text-base md:text-lg text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
            36 módulos integrados — clique para expandir e descobrir cada funcionalidade
          </p>
        </motion.div>

        {/* Categorias */}
        {CATEGORIES.map((cat, catIdx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: catIdx * 0.1, duration: 0.5 }}
            className={catIdx > 0 ? "mt-20" : ""}
          >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.12] flex items-center justify-center shrink-0">
                <cat.icon className="w-6 h-6 text-[#D80E16]" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F111A]">{cat.titulo}</h3>
                <p className="text-sm text-[#5E6278] mt-1">{cat.descricao}</p>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto">
              {cat.modulos.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <ExpandableModuleCard {...item} />
                </motion.div>
              ))}
            </div>

            {/* Category CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center mt-8"
            >
              <Link
                to={cat.ctaRota}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#D80E16]/20 text-[#D80E16] font-bold text-sm hover:bg-[#D80E16]/[0.04] hover:border-[#D80E16]/40 transition-all shadow-sm"
              >
                {cat.ctaTexto} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Divider (except last) */}
            {catIdx < CATEGORIES.length - 1 && (
              <div className="mt-16 border-t border-[#D80E16]/[0.08]" />
            )}
          </motion.div>
        ))}

        {/* Global CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-20 pt-12 border-t border-[#D80E16]/[0.08]"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#D80E16] text-white font-bold text-base hover:bg-[#b80c12] transition-all shadow-lg shadow-[#D80E16]/20 hover:shadow-xl hover:shadow-[#D80E16]/30 btn-glow"
          >
            Começar Gratuitamente <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
