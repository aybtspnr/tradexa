import { Helmet } from "react-helmet-async";

interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: object;
}

const BASE_URL = "https://www.tradexa.com.br";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "TRADEXA";

export function useSeo(config: SeoConfig) {
  const base = SITE_NAME;
  const fullTitle = config.title.includes(base)
    ? config.title
    : `${config.title} | ${base}`;

  const description =
    config.description ||
    "Plataforma de Market Intelligence para Comércio Exterior com classificação NCM, consulta HTS, tarifas globais e análise de mercado.";
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const canonical = config.canonical || (typeof window !== "undefined"
    ? `${BASE_URL}${window.location.pathname}${window.location.search}`
    : `${BASE_URL}/`);
  const ogType = config.ogType || "website";

  // Auto-noindex on non-production domains (Vercel preview, etc.)
  const isProductionDomain = typeof window !== "undefined" &&
    (window.location.hostname === "www.tradexa.com.br" || window.location.hostname === "tradexa.com.br");
  const effectiveNoIndex = config.noIndex || (typeof window !== "undefined" && !isProductionDomain);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      {effectiveNoIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta name="author" content="TRADEXA" />
      <meta name="geo.region" content="BR-SC" />
      <meta name="geo.placename" content="Florianópolis" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="pt-BR" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Structured Data */}
      {config.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(config.jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
