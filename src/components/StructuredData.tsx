"use client";

/**
 * StructuredData — Renderiza JSON-LD structured data para SEO
 * 
 * Tipos suportados: Article, FAQ, BreadcrumbList, WebSite, Organization
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleData {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
  image?: string;
}

interface StructuredDataProps {
  type: "Article" | "FAQ" | "WebSite" | "Organization";
  data?: ArticleData;
  faqItems?: FAQItem[];
}

export default function StructuredData({ type, data, faqItems }: StructuredDataProps) {
  let jsonLd: Record<string, unknown>;

  switch (type) {
    case "Article":
      if (!data) return null;
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.headline,
        description: data.description,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          "@type": "Organization",
          name: data.authorName || "TRADEXA",
          url: "https://www.tradexa.com.br",
        },
        image: data.image || "https://www.tradexa.com.br/og-image.png",
        publisher: {
          "@type": "Organization",
          name: "TRADEXA",
          logo: {
            "@type": "ImageObject",
            url: "https://www.tradexa.com.br/favicon-48x48.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": data.url || (typeof window !== "undefined" ? window.location.href : "https://www.tradexa.com.br"),
        },
      };
      break;

    case "FAQ":
      if (!faqItems || faqItems.length === 0) return null;
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };
      break;

    case "WebSite":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "TRADEXA Market Intelligence",
        url: "https://www.tradexa.com.br",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.tradexa.com.br/ai-search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      };
      break;

    case "Organization":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "TRADEXA",
        url: "https://www.tradexa.com.br",
        logo: "https://www.tradexa.com.br/favicon-48x48.png",
        description: "Plataforma de inteligência comercial para comércio exterior brasileiro.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Florianópolis",
          addressRegion: "SC",
          addressCountry: "BR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "contato@tradexa.com.br",
          availableLanguage: "Portuguese",
        },
      };
      break;

    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
