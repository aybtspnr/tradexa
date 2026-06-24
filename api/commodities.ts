/**
 * Vercel serverless — commodity prices
 * Primary: Alpha Vantage (WTI, BRENT, COPPER, CORN)
 * Fallback: Yahoo Finance (for all symbols)
 * Endpoint: /api/commodities
 */

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || '';

// Alpha Vantage supported commodity functions
const AV_SYMBOLS = ['WTI', 'BRENT', 'COPPER', 'CORN'];

const SYMBOLS = [
  { name: 'Soja', avFunc: null, yfSymbol: 'ZS=F', unit: 'US¢/bushel' },
  { name: 'Petróleo WTI', avFunc: 'WTI', yfSymbol: 'CL=F', unit: 'USD/barril' },
  { name: 'Petróleo Brent', avFunc: 'BRENT', yfSymbol: 'BZ=F', unit: 'USD/barril' },
  { name: 'Cobre', avFunc: 'COPPER', yfSymbol: 'HG=F', unit: 'USD/lb' },
  { name: 'Milho', avFunc: 'CORN', yfSymbol: 'ZC=F', unit: 'US¢/bushel' },
  { name: 'Ouro', avFunc: null, yfSymbol: 'GC=F', unit: 'USD/oz' },
  { name: 'Prata', avFunc: null, yfSymbol: 'SI=F', unit: 'USD/oz' },
  { name: 'Café', avFunc: null, yfSymbol: 'KC=F', unit: 'US¢/lb' },
];

interface CommodityData {
  name: string;
  symbol: string;
  price: number | null;
  unit: string;
  change: number | null;
  changePercent: number | null;
  source: 'alpha_vantage' | 'yahoo_fallback';
}

let cached: CommodityData[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 300000; // 5 min

async function fetchFromAlphaVantage(func: string): Promise<{ price: number | null; date: string | null } | null> {
  if (!ALPHA_VANTAGE_KEY) return null;
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=${func}&apikey=${ALPHA_VANTAGE_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as any;
    const dataArr = data?.data;
    if (!Array.isArray(dataArr) || dataArr.length < 1) return null;

    const latest = dataArr[0];
    const price = parseFloat(latest?.value);
    const date = latest?.date;

    // Calculate change from previous day if available
    let change = null;
    if (dataArr.length >= 2) {
      const previous = parseFloat(dataArr[1]?.value);
      if (!isNaN(previous) && previous > 0) {
        change = price - previous;
      }
    }

    return {
      price: isNaN(price) ? null : price,
      date,
    };
  } catch {
    return null;
  }
}

async function fetchFromYahoo(symbol: string): Promise<{ price: number | null; change: number | null; changePercent: number | null } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as any;
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      price: meta.regularMarketPrice ?? null,
      change: meta.regularMarketChange ?? null,
      changePercent: meta.regularMarketChangePercent ?? null,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return Response.json({ commodities: cached, updatedAt: new Date(lastFetch).toISOString() });
  }

  const results: CommodityData[] = [];

  // Fetch Alpha Vantage for supported symbols (with rate limiting)
  const avResults = new Map<string, { price: number | null; date: string | null }>();
  for (const func of AV_SYMBOLS) {
    const result = await fetchFromAlphaVantage(func);
    if (result?.price) avResults.set(func, result);
    await new Promise(r => setTimeout(r, 1500)); // Rate limit: ~4 req/min
  }

  // Build results with AV first, Yahoo fallback
  for (const s of SYMBOLS) {
    if (s.avFunc && avResults.has(s.avFunc)) {
      const av = avResults.get(s.avFunc)!;
      results.push({
        name: s.name,
        symbol: s.avFunc,
        price: av.price,
        unit: s.unit,
        change: null, // AV monthly data doesn't have daily change
        changePercent: null,
        source: 'alpha_vantage',
      });
    } else {
      // Fallback to Yahoo
      const yf = await fetchFromYahoo(s.yfSymbol);
      results.push({
        name: s.name,
        symbol: s.yfSymbol,
        price: yf?.price ?? null,
        unit: s.unit,
        change: yf?.change ?? null,
        changePercent: yf?.changePercent ?? null,
        source: 'yahoo_fallback',
      });
    }
  }

  cached = results;
  lastFetch = now;
  return Response.json({ commodities: results, updatedAt: new Date().toISOString() });
}
