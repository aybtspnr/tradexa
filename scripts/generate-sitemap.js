#!/usr/bin/env node
/**
 * Sitemap Generator — COMPLETO e Dinâmico
 *
 * Lê automaticamente as rotas do App.tsx (como o IndexNow script)
 * e gera sitemap.xml com TODAS as páginas públicas.
 *
 * Uso: node scripts/generate-sitemap.js
 * Executado como pre-build: "build": "node scripts/generate-sitemap.js && vite build"
 */

import { writeFileSync, readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const BASE_URL = "https://www.tradexa.com.br";
const TODAY = new Date().toISOString().split("T")[0];

function urlEntry(url, priority = "0.8", changefreq = "monthly", lastmod = TODAY) {
  return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ═══════════════ ROTAS DO APP — DINÂMICO ═══════════════

/** Extrai slugs de blog do postMeta.ts (mesmo source do IndexNow) */
function extractBlogSlugs() {
  const metaPath = resolve(PROJECT_ROOT, "src/data/blog/postMeta.ts");
  const slugs = [];
  try {
    const content = readFileSync(metaPath, "utf-8");
    // Match only value assignments, not type declarations
    const regex = /\bslug:\s*["']([^"']+)["']/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      // Skip type definition line
      if (m[1] === "string;") continue;
      slugs.push(m[1]);
    }
  } catch (err) {
    console.error("⚠️  Erro ao ler postMeta.ts:", err.message);
  }
  return [...new Set(slugs)];
}

/** Parse todas as rotas de App.tsx */
function getStaticPages() {
  const appPath = resolve(PROJECT_ROOT, "src/App.tsx");
  const appContent = readFileSync(appPath, "utf-8");

  // All Route paths
  const routeRegex = /<Route[^>]*path="([^"]*)"/g;
  const allRoutes = new Set();
  let m;
  while ((m = routeRegex.exec(appContent)) !== null) allRoutes.add(m[1]);

  // Routes that redirect or are aliases — should NOT be indexed
  const REDIRECT_ROUTES = new Set([
    "/about",            // → /sobre
    "/maritime_freight", // → /maritime-freight
    "/landing-index",    // alias
    "/landing-about",    // alias
    "/landing-api",      // alias
    "/landing-privacy",  // alias
    "/landing-terms",    // alias
    "/hs-lookup",        // → /ai-search
    "/credits",          // → /plans
    "/export-wizard",    // → /ai-search
    "/export-opportunities", // → /importadores
    "/freight-calculator",   // → /maritime-freight-map
    "/global-trade",     // → /trade-intelligence
    "/cross-data-comparison", // → /trade-intelligence
    "/competitor-intel", // → /importadores
    "/export-intelligence", // → /trade-intelligence
    "/import-intelligence", // → /trade-intelligence
    "/market-intelligence", // → /trade-intelligence
    "/trade-news",       // → /importadores
    "/wizard",           // → /ai-search
    "/route-optimizer",  // → /maritime-freight-map
    "/tariff-simulator", // → /global-tariff
    "/price-arbitrage",  // → /importadores
    "/suppliers",        // → /importadores
    "/seasonal-alerts",  // → /seasonal-calendar
    "/coming-soon",      // placeholder page
    "/comercio-brasil-eua", // redirect via vercel.json → /us-trade
    "/comparar-ncm",     // redirect via vercel.json → /ncm-comparison
    "/comparar-paises",  // redirect via vercel.json → /country-comparison
    "/simulador-exportacao", // redirect via vercel.json → /export-simulator
    "/inteligencia-comercial", // redirect via vercel.json → /import-export-data
    "/ranking-mercados",  // redirect via vercel.json → /smart-rank
    "/cadeia-suprimentos", // redirect via vercel.json → /supply-chain
    "/mapa-frete-maritimo", // redirect via vercel.json → /maritime-freight-map
    "/tarifario-global",  // redirect via vercel.json → /global-tariff
    "/port-intelligence", // redirect via App.tsx → /port-activity
  ]);

  // Routes that have Navigate as element (redirect sources) — should NOT be indexed
  const redirectSources = new Set();
  const redirectSrcRegex = /<Route\s+path="([^"]*)"[^>]*element={<Navigate[^>]*\/>/g;
  let r;
  while ((r = redirectSrcRegex.exec(appContent)) !== null) redirectSources.add(r[1]);

  // Filter
  const pages = [];
  for (const route of allRoutes) {
    if (route === "*") continue;
    if (route.includes(":")) continue; // dynamic
    if (route.includes("/admin")) continue; // admin pages (private)
    if (route.includes("/settings")) continue;
    if (route.includes("/dashboard")) continue;
    if (route.includes("/invoices")) continue;
    if (route.includes("/client")) continue;
    if (route.includes("/cliente/")) continue;
    if (route.includes("/my-usage")) continue;
    if (route.includes("/reset-password")) continue;
    if (route.includes("/forgot-password")) continue;
    if (route === "/login") continue;
    if (route === "/register") continue;
    if (redirectSources.has(route)) continue; // pages that are just redirects
    if (REDIRECT_ROUTES.has(route)) continue; // alias/redirect pages
    pages.push(route);
  }

  return pages.sort();
}

// ═══════════════ GERAR SITEMAP ═══════════════

const blogSlugs = extractBlogSlugs();
const staticPages = getStaticPages();

const urls = [];

// Home (highest priority)
urls.push(urlEntry("/", "1.0", "weekly"));

// All static public pages
for (const page of staticPages) {
  if (page === "/") continue; // already added
  const priority = page.startsWith("/blog") || page.startsWith("/noticias") ? "0.9" :
                   page.startsWith("/landing/") ? "0.7" : "0.8";
  const changefreq = page.startsWith("/blog") || page.startsWith("/noticias") ? "daily" :
                     page === "/" || page.startsWith("/ferramentas") ? "weekly" : "monthly";
  urls.push(urlEntry(page, priority, changefreq));
}

// Blog list
urls.push(urlEntry("/blog", "0.9", "daily"));

// Blog posts
for (const slug of blogSlugs) {
  urls.push(urlEntry(`/blog/${slug}`, "0.8", "monthly"));
}

// ═══════════════ ESCREVER XML ═══════════════

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join("\n")}
</urlset>`;

const outputPath = resolve(PROJECT_ROOT, "public/sitemap.xml");
writeFileSync(outputPath, xml, "utf-8");

console.log(`✅ Sitemap dinâmico gerado:`);
console.log(`   📄 Páginas públicas: ${staticPages.length}`);
console.log(`   📝 Blog posts: ${blogSlugs.length}`);
console.log(`   📊 Total: ${urls.length} URLs`);
console.log(`   📁 ${outputPath}`);
