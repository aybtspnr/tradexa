import { Helmet } from "react-helmet-async";

interface SEOMetadataProps {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  schemaType?: "SoftwareApplication" | "WebApplication" | "Article" | "Product" | "Organization" | "FAQPage";
  schemaData?: Record<string, unknown>;
  noindex?: boolean;
}

const SITE_URL = "https://www.tradexa.com.br";
const DEFAULT_OG_IMAGE = "https://www.tradexa.com.br/og-image.png";
const OG_IMAGE_WIDTH = "1280";
const OG_IMAGE_HEIGHT = "426";

export default function SEOMetadata({
  title,
  description = "Inteligência comercial para importação e exportação. Classificação NCM, tarifas globais, dados de comércio exterior e frete marítimo.",
  keywords,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonical,
  schemaType,
  schemaData,
  noindex = false,
}: SEOMetadataProps) {
  const fullTitle = title.includes("TRADEXA") ? title : `${title} — TRADEXA`;
  const fullOgTitle = ogTitle || title;
  const fullOgDescription = ogDescription || description;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  const buildSchema = (): Record<string, unknown> | null => {
    if (!schemaType) return null;

    const baseSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: fullTitle,
      description: fullOgDescription,
      url: canonicalUrl || SITE_URL,
    };

    if (schemaType === "SoftwareApplication" || schemaType === "WebApplication") {
      return {
        ...baseSchema,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "1",
        },
        ...schemaData,
      };
    }

    if (schemaType === "Article") {
      return {
        ...baseSchema,
        headline: fullOgTitle,
        image: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
        author: {
          "@type": "Organization",
          name: "TRADEXA",
        },
        publisher: {
          "@type": "Organization",
          name: "TRADEXA",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/og-image.png`,
          },
        },
        datePublished: new Date().toISOString().split("T")[0],
        dateModified: new Date().toISOString().split("T")[0],
        ...schemaData,
      };
    }

    if (schemaType === "Product") {
      return {
        ...baseSchema,
        brand: {
          "@type": "Brand",
          name: "TRADEXA",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
        },
        ...schemaData,
      };
    }

    if (schemaType === "Organization") {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "TRADEXA Market Intelligence",
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        description: fullOgDescription,
        sameAs: [
          "https://www.linkedin.com/company/tradexa",
        ],
        ...schemaData,
      };
    }

    if (schemaType === "FAQPage") {
      return {
        ...baseSchema,
        mainEntity: schemaData?.mainEntity || [],
      };
    }

    return { ...baseSchema, ...schemaData };
  };

  const schemaJson = buildSchema();

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullOgTitle} />
      <meta property="og:description" content={fullOgDescription} />
      <meta property="og:image" content={ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`} />
      <meta property="og:image:width" content={OG_IMAGE_WIDTH} />
      <meta property="og:image:height" content={OG_IMAGE_HEIGHT} />
      <meta property="og:image:alt" content={fullOgTitle} />
      <meta property="og:site_name" content="TRADEXA" />
      <meta property="og:locale" content="pt_BR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullOgTitle} />
      <meta name="twitter:description" content={fullOgDescription} />
      <meta name="twitter:image" content={ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`} />
      <meta name="twitter:image:alt" content={fullOgTitle} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang — Portuguese (Brazil) */}
      {canonicalUrl && <link rel="alternate" hrefLang="pt-BR" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Schema.org JSON-LD */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
}
