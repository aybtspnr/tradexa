#!/usr/bin/env node
/**
 * IndexNow — Submit ALL TradeXA URLs to Bing/Google/Yandex/Seznam
 * Auto-generates URL list from App.tsx — always up to date
 * Replaces the old hardcoded script that missed 80% of pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const INDEXNOW_KEY = "cf8db643-7401-4626-b550-85c1afe749ee";
const SITE_HOST = "www.tradexa.com.br";

/** Parse all unique path= values from App.tsx and return only actual pages (not redirects) */
function getStaticPages() {
  const appPath = path.join(ROOT, "src", "App.tsx");
  const appContent = fs.readFileSync(appPath, "utf-8");

  // Extract all path="..." values from <Route ... path="...">
  const routeRegex = /<Route[^>]*path="([^"]*)"/g;
  const allRoutes = new Set();
  let match;
  while ((match = routeRegex.exec(appContent)) !== null) {
    allRoutes.add(match[1]);
  }

  // Extract Navigate redirect targets: <Navigate to="..."
  const navTargets = new Set();
  const navRegex = /<Navigate[^>]*to="([^"]*)"/g;
  while ((match = navRegex.exec(appContent)) !== null) {
    navTargets.add(match[1]);
  }

  // Filter: skip catch-all, skip dynamic routes with ":", skip redirects
  const pages = [];
  for (const route of allRoutes) {
    if (route === "*") continue;
    if (route.includes(":")) continue; // dynamic routes like /blog/:slug
    if (navTargets.has(route)) continue; // route IS a redirect (path matches a Navigate to=)
    pages.push(route);
  }

  return pages.sort();
}

/** Extract all blog slugs from postMeta.ts */
function getBlogSlugs() {
  const metaPath = path.join(ROOT, "src", "data", "blog", "postMeta.ts");
  const content = fs.readFileSync(metaPath, "utf-8");
  const slugs = [];
  let match2;
  const regex = /slug:\s*["']([^"']+)["']/g;
  while ((match2 = regex.exec(content)) !== null) {
    slugs.push(match2[1]);
  }
  return [...new Set(slugs)]; // deduplicate
}

function main() {
  const staticPages = getStaticPages();
  const blogSlugs = getBlogSlugs();

  const urlList = [
    ...staticPages.map((p) => `https://${SITE_HOST}${p}`),
    ...blogSlugs.map((slug) => `https://${SITE_HOST}/blog/${slug}`),
  ];

  console.log(`[IndexNow] Generated ${staticPages.length} static pages + ${blogSlugs.length} blog posts = ${urlList.length} total URLs`);

  // Submit in batches of 1000 (IndexNow limit)
  const batchSize = 1000;
  const batches = [];
  for (let i = 0; i < urlList.length; i += batchSize) {
    batches.push(urlList.slice(i, i + batchSize));
  }

  console.log(`[IndexNow] Submitting in ${batches.length} batch(es)...`);

  Promise.all(batches.map(async (batch, idx) => {
    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_KEY,
          keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
          urlList: batch,
        }),
      });
      if (res.ok) {
        console.log(`[IndexNow] Batch ${idx + 1}: ${batch.length} URLs submitted (${res.status})`);
      } else {
        const text = await res.text();
        console.error(`[IndexNow] Batch ${idx + 1} error: ${res.status} ${res.statusText} — ${text}`);
      }
    } catch (err) {
      console.error(`[IndexNow] Batch ${idx + 1} failed: ${err.message}`);
    }
  })).then(() => {
    console.log(`[IndexNow] Done! ${urlList.length} URLs submitted to IndexNow.`);
  });

  // Also ping Google with the sitemap (deprecated but still worth trying)
  const sitemapUrl = `https://${SITE_HOST}/sitemap.xml`;
  fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
    signal: AbortSignal.timeout(10000),
  })
    .then((r) => {
      if (r.ok) {
        console.log(`[Google] Sitemap pinged: ${sitemapUrl}`);
      } else if (r.status === 404) {
        console.log(`[Google] Ping endpoint deprecated (404). Submit sitemap manually in Google Search Console.`);
      } else {
        console.log(`[Google] Ping returned ${r.status}`);
      }
    })
    .catch((err) => console.log(`[Google] Ping failed: ${err.message}`));
}

main();
