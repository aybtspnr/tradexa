/**
 * Solução para Operadores Logísticos — landing page para agentes de carga e trading companies
 */
import { Ship, Navigation, Globe, Radio, BarChart3, Database } from "lucide-react";
import { SolutionPageTemplate, type SolutionPageData } from "@/components/SolutionPageTemplate";

const data: SolutionPageData = {
  slug: "operadores-logisticos",
  audience: "Operadores Logísticos",
  title: "Sua Central de Inteligência Logística",
  subtitle: "Supply Chain Map ao vivo, Track & Trace, tarifário global e dados de trade intelligence — ferramentas profissionais para agentes de carga e trading companies.",
  heroDesc: "Acompanhe milhares de navios e aviões em tempo real, consulte alíquotas de 31 países, analise rotas comerciais e ofereça um nível superior de serviço aos seus clientes.",
  color: "#0ea5e9",
  painPoints: [
    {
      pain: "Seus clientes querem saber onde está a carga AGORA, mas você depende de informações fragmentadas de cada armador.",
      solution: "O Supply Chain Map e Track & Trace mostram navios e aviões cargueiros ao vivo via AIS satélite e ADS-B. Dê aos seus clientes visibilidade em tempo real que nem todos os armadores oferecem.",
    },
    {
      pain: "Precificar fretes e consultar tarifas para múltiplas rotas e produtos demanda horas de pesquisa manual.",
      solution: "O Tarifário Global com alíquotas de 31 países e o Mapa de Frete Marítimo com preços WCI indexados permitem cotações rápidas e precisas em segundos.",
    },
    {
      pain: "Analisar rotas, portos e competitividade para recomendar a melhor opção ao cliente exige cruzar dados de várias fontes.",
      solution: "O Trade Intelligence e o Comparador de Portos trazem dados consolidados de volumes, frequências, transit time e infraestrutura portuária — tudo em um dashboard.",
    },
  ],
  tools: [
    { title: "Supply Chain Map", route: "/landing/supply-chain", icon: Radio, color: "#D80E16", desc: "12.500+ navios e aviões de carga ao vivo no mapa mundial" },
    { title: "Track & Trace", route: "/landing/track-trace", icon: Navigation, color: "#D80E16", desc: "Busca por nome, MMSI, IMO ou callsign em tempo real" },
    { title: "Mapa de Frete Marítimo", route: "/landing/maritime-freight-map", icon: Ship, color: "#0ea5e9", desc: "Rotas 3D interativas com preços WCI indexados" },
    { title: "Tarifário Global", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b", desc: "Alíquotas de importação em 31 países para consulta rápida" },
    { title: "Trade Intelligence", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981", desc: "Dados de comércio exterior por país, porto e produto" },
    { title: "Rastreamento de Carga", route: "/landing/rastreamento", icon: Navigation, color: "#8b5cf6", desc: "DHL, FedEx, UPS, Maersk, ZIM em uma interface" },
    { title: "Comparador de Portos", route: "/ferramentas/comparador-portos", icon: Ship, color: "#06b6d4", desc: "Infraestrutura, frequência e conectividade portuária" },
    { title: "API de Dados", route: "/landing/import-dashboard", icon: Database, color: "#8b5cf6", desc: "Integre dados de comércio exterior nos seus sistemas" },
  ],
  benefits: [
    "Visibilidade ao vivo de navios, aviões e containers — diferencial competitivo",
    "Informações que nem todos os armadores disponibilizam",
    "Tarifário global para cotações rápidas e precisas",
    "Dados de trade intelligence para consultoria de rotas",
    "Ferramentas gratuitas e abertas (Supply Chain Map, Track & Trace)",
    "API para integração com seus sistemas internos",
    "Suporte para agentes de carga e trading companies",
  ],
  ctaRoute: "/register",
};

export default function OperadoresLogisticosSolucaoPage() {
  return <SolutionPageTemplate data={data} />;
}
