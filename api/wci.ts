/**
 * Vercel serverless — World Container Freight Index (WCI)
 * Returns current WCI value and trend.
 * 
 * GET /api/wci  — returns current WCI and trend
 * POST /api/wci — updates WCI (requires WCI_API_KEY)
 *
 * Requires Vercel env vars: SUPABASE_URL, SUPABASE_ANON_KEY, WCI_API_KEY
 */

// These come from Vercel env vars (not VITE_ prefixed — those are client-only)
// Set SUPABASE_URL and SUPABASE_ANON_KEY with the same values as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
const SUPA_URL = process.env.SUPABASE_URL || "";
const SUPA_ANON = process.env.SUPABASE_ANON_KEY || "";

// Fallback default (used when Supabase is unreachable)
const DEFAULT_WCI = 3969;

interface WciResponse {
  wci: number;
  updatedAt: string;
  trend: 'up' | 'down' | 'stable';
}

let cached: WciResponse | null = null;
let lastFetch = 0;
const CACHE_TTL = 3600000; // 1 hour

async function fetchWciFromSupabase(): Promise<number | null> {
  if (!SUPA_URL) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/freight_index?select=wci_value,updated_at&order=updated_at.desc&limit=1`,
      {
        headers: {
          "apikey": SUPA_ANON,
          "Authorization": `Bearer ${SUPA_ANON}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].wci_value) {
      return parseFloat(data[0].wci_value);
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    });
  }

  let currentWci: number = DEFAULT_WCI;

  // Try Supabase first
  const supaWci = await fetchWciFromSupabase();
  if (supaWci) {
    currentWci = supaWci;
  }

  // Determine trend by comparing with last cached value
  let trend: WciResponse['trend'] = 'stable';
  if (cached && cached.wci !== currentWci) {
    trend = currentWci > cached.wci ? 'up' : 'down';
  }

  cached = {
    wci: Math.round(currentWci),
    updatedAt: new Date().toISOString(),
    trend,
  };

  lastFetch = now;
  return Response.json(cached, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
  });
}

/**
 * POST /api/wci — Update the WCI value
 * Requires WCI_API_KEY env var for auth.
 */
export async function POST(request: Request) {
  const apiKey = process.env.WCI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "WCI_API_KEY not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${apiKey}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!SUPA_URL) {
    return Response.json({ error: "SUPABASE_URL not configured" }, { status: 500 });
  }

  try {
    const { wci } = await request.json();
    if (!wci || typeof wci !== 'number' || wci < 500 || wci > 20000) {
      return Response.json({ error: "Invalid WCI value. Must be between 500 and 20000." }, { status: 400 });
    }

    // Store in Supabase
    const res = await fetch(`${SUPA_URL}/rest/v1/freight_index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPA_ANON,
        "Authorization": `Bearer ${SUPA_ANON}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        wci_value: wci,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Failed to store: ${errText}`, status: res.status }, { status: 500 });
    }

    // Bust cache
    cached = null;
    lastFetch = 0;

    return Response.json({
      success: true,
      wci,
      message: `WCI updated to ${wci}.`,
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
