import { useEffect } from "react";

interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonical?: string;
  jsonLd?: object;
}

const BASE_URL = "https://www.tradexa.com.br";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function useSeo(config: SeoConfig) {
  useEffect(() => {
    const base = "TRADEXA";
    const fullTitle = config.title.includes(base)
      ? config.title
      : `${config.title} | ${base}`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string) => {
      const attr = name.startsWith("og:") || name.startsWith("twitter:") ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const removeMeta = (name: string) => {
      const attr = name.startsWith("og:") || name.startsWith("twitter:") ? "property" : "name";
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    // Remove old dynamic meta to avoid duplicates, then set fresh
    const dynamicMetas = document.querySelectorAll("[data-seo]");
    dynamicMetas.forEach(el => el.remove());

    const ogImage = config.ogImage || DEFAULT_OG_IMAGE;

    if (config.description) setMeta("description", config.description);
    if (config.keywords) setMeta("keywords", config.keywords);

    // Open Graph
    setMeta("og:type", config.ogType || "website");
    setMeta("og:title", fullTitle);
    setMeta("og:description", config.description || "");
    setMeta("og:image", ogImage);
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("og:url", config.canonical || window.location.href);
    setMeta("og:site_name", "TRADEXA");
    setMeta("og:locale", "pt_BR");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", config.description || "");
    setMeta("twitter:image", ogImage);
    setMeta("twitter:site", "@tradexa_br");

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = config.canonical || window.location.href;

    // Structured Data
    if (config.jsonLd) {
      let script = document.querySelector("#seo-ldjson") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-ldjson";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(config.jsonLd);
    }
  }, [
    config.title,
    config.description,
    config.keywords,
    config.ogType,
    config.ogImage,
    config.canonical,
    config.jsonLd,
  ]);
}
