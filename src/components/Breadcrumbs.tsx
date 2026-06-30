"use client";

import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";

/** Mapeamento de rotas para nomes legíveis */
const ROUTE_LABELS: Record<string, string> = {
  "": "Início",
  about: "Sobre",
  contact: "Contato",
  contato: "Contato",
  privacy: "Privacidade",
  terms: "Termos de Uso",
  blog: "Blog",
  glossario: "Glossário",
  recursos: "Recursos",
  "trabalhe-conosco": "Trabalhe Conosco",
  pricing: "Planos",
  login: "Login",
  register: "Cadastro",
  dashboard: "Dashboard",
  "supply-chain": "Supply Chain Map",
  "maritime-freight-map": "Mapa de Frete Marítimo",
  services: "Serviços",




  "importers-map": "Mapa Comercial",

  "trade-intelligence": "Trade Intelligence",

  "ai-search": "Busca IA",
  "hts-lookup": "HTS Lookup",
  "hs-classifier": "Classificador HS",

  intelligence: "Intelligence Dashboard",
  plans: "Planos",
  "my-usage": "Meu Uso",
  settings: "Configurações",
  "client-welcome": "Bem-vindo",
  "casos-de-uso": "Casos de Uso",
  "forgot-password": "Recuperar Senha",
  "reset-password": "Redefinir Senha",
  admin: "Admin",
  // Landing pages
  "landing-about": "Sobre",
  "landing-api": "API Docs",
  // "coming-soon": "Em Breve",
  // "landing-index": "Plataforma",
  "landing-privacy": "Privacidade",
  "landing-terms": "Termos",
  // Landing de ferramentas
  "landing/import-dashboard": "Import Dashboard",
  "landing/import-search": "Busca de Importação",
  "landing/import-map": "Mapa de Importação",
  "landing/export-dashboard": "Export Dashboard",
  "landing/export-opportunities": "Oportunidades de Exportação",
  "landing/global-explorer": "Explorador Global",
  "landing/market-intelligence": "Inteligência de Mercado",
  "landing/price-arbitrage": "Arbitragem de Preços",
  "landing/ncm-classifier": "Classificador IA NCM",
  "landing/tariff-calculator": "Calculadora de Tarifas",
  "landing/smart-alerts": "Alertas Inteligentes",
  "landing/export-wizard": "Export Wizard",
  "landing/importadores": "Diretório de Importadores",
  "landing/maritime-freight": "Frete Marítimo",
  "landing/maritime-freight-map": "Mapa de Frete",
  "landing/supply-chain": "Supply Chain Map",
  "landing/calculadora-importacao": "Calculadora de Importação",
  "landing/lista-ncm": "Lista NCM",
  // Services subpages
  "services/import-intelligence": "Import Intelligence",
  "services/export-intelligence": "Export Intelligence",
  "services/tools": "Ferramentas",
  "services/market-analysis": "Análise de Mercado",
  "services/alertas": "Alertas",
  "services/maps": "Mapas",
  "services/api": "API",
  // Trade intelligence subpages
  "trade-intelligence/countries": "Países",
};

/** Páginas que não devem mostrar breadcrumbs */
const HIDE_ON: string[] = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  // Não mostrar na home e páginas de auth
  if (HIDE_ON.includes(pathname) || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items: { label: string; path: string }[] = [
    { label: "Início", path: "/" },
  ];

  let accumulatedPath = "";
  for (const segment of segments) {
    accumulatedPath += "/" + segment;
    // Handle nested landing routes
    let lookupKey = segment;
    if (segments[0] === "landing" && segments.length > 1) {
      lookupKey = segments.join("/");
    }
    const label = ROUTE_LABELS[lookupKey] || ROUTE_LABELS[segments.join("/")] || formatSegment(segment);
    items.push({ label, path: accumulatedPath });
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.label + item.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Inject structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: unique.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `https://www.tradexa.com.br${item.path}`,
    })),
  };

  if (unique.length <= 1) return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="bg-[#FAFAF9] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <ol className="flex items-center gap-1.5 text-xs overflow-x-auto whitespace-nowrap scrollbar-hide">
            {unique.map((item, i) => (
              <li key={item.path} className="flex items-center gap-1.5 shrink-0">
                {i > 0 && (
                  <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                )}
                {i === unique.length - 1 ? (
                  <span className="font-semibold text-[#0F111A]">{item.label}</span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-[#D80E16] transition-colors font-medium"
                  >
                    {i === 0 ? (
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        <span className="sr-only">Início</span>
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}

/** Transforma segmento de URL em label legível */
function formatSegment(s: string): string {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Ncm/g, "NCM")
    .replace(/Hs/g, "HS")
    .replace(/Ia/g, "IA")
    .replace(/Api/g, "API")
    .replace(/Hts/g, "HTS")
    .replace(/Us/g, "US");
}
