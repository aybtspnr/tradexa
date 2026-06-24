/**
 * IndexNow submission endpoint
 * POST /api/indexnow — submits URLs to IndexNow search engines
 * GET /api/indexnow/key — returns the site's IndexNow key
 *
 * Usage:
 *   POST /api/indexnow  body: { urls?: string[] }  (optional, defaults to all public pages)
 *   GET  /api/indexnow/key → { key: "cf8db643-..." }
 */

const INDEXNOW_KEY = "cf8db643-7401-4626-b550-85c1afe749ee";
const SITE_HOST = "www.tradexa.com.br";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// All public URLs to submit
const PUBLIC_URLS = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/pricing",
  "/login",
  "/register",
  "/supply-chain",
  "/services",
  // Landing pages
  "/landing/import-dashboard",
  "/landing/import-search",
  "/landing/import-map",
  "/landing/export-dashboard",
  "/landing/export-opportunities",
  "/landing/global-explorer",
  "/landing/market-intelligence",
  "/landing/price-arbitrage",
  "/landing/ncm-classifier",
  "/landing/tariff-calculator",
  "/landing/smart-alerts",
  "/landing/export-wizard",
  "/landing/importadores",
  "/landing/maritime-freight",
  "/landing/supply-chain",
];

async function submitToIndexNow(urls: string[]) {
  const fullUrls = urls.map((u) =>
    u.startsWith("http") ? u : `https://${SITE_HOST}${u}`
  );

  const body = JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    urlList: fullUrls,
  });

  console.log(`[IndexNow] Submitting ${fullUrls.length} URLs...`);

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: AbortSignal.timeout(15000),
  });

  if (res.ok) {
    console.log(`[IndexNow] Successfully submitted ${fullUrls.length} URLs`);
  } else {
    console.error(`[IndexNow] Submission failed: ${res.status} ${await res.text()}`);
  }

  return { status: res.status, ok: res.ok, count: fullUrls.length };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/key")) {
    return Response.json({ key: INDEXNOW_KEY, host: SITE_HOST });
  }
  return Response.json({
    message: "Use POST to submit URLs. GET /api/indexnow/key for the site key.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls = body.urls || PUBLIC_URLS;
    const result = await submitToIndexNow(urls);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
