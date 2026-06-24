/**
 * Vercel serverless — ALL aircraft via adsb.lol
 * Endpoint: /api/cargo-flights
 */

const REGIONS = [
  // 6 regiões cobrindo o globo
  { lat: 39.8, lon: -98.5, dist: 2500 },   // América do Norte
  { lat: 50.0, lon: 15.0, dist: 2500 },     // Europa
  { lat: 35.0, lon: 105.0, dist: 2500 },    // Ásia
  { lat: -15.0, lon: -60.0, dist: 2500 },   // América do Sul
  { lat: 0.0, lon: 20.0, dist: 2500 },      // África + Oriente Médio
  { lat: -25.0, lon: 133.0, dist: 2500 },   // Oceania
];

const MAX_FLIGHTS = 100000; // "ilimitado" — adsb.lol que define o limite real
const REQ_TIMEOUT = 7000;   // 7s por região
const CACHE_TTL = 25000;    // 25s cache

let cachedResponse: any = null;
let lastFetch = 0;

async function fetchRegion(region: typeof REGIONS[0]): Promise<any[]> {
  try {
    const url = `https://api.adsb.lol/v2/lat/${region.lat}/lon/${region.lon}/dist/${region.dist}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(REQ_TIMEOUT) });
    if (res.ok) {
      const data: any = await res.json();
      return data.ac || [];
    }
  } catch { /* timeout — ignore */ }
  return [];
}

export async function GET() {
  const now = Date.now();

  if (cachedResponse && now - lastFetch < CACHE_TTL) {
    return Response.json(cachedResponse);
  }

  const results = await Promise.allSettled(REGIONS.map(r => fetchRegion(r)));

  const allRaw: any[] = [];
  const seenHex = new Set<string>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const ac of result.value) {
        const hex = ((ac.hex || '') as string).toLowerCase().trim();
        if (hex && !seenHex.has(hex)) {
          seenHex.add(hex);
          allRaw.push(ac);
        }
      }
    }
  }

  const flights = allRaw
    .filter((f: any) => {
      if (f.lat == null || f.lon == null) return false;
      if (f.lat === 0 && f.lon === 0) return false;
      const alt = f.alt_baro;
      if (alt === 0 || alt === 'ground') return false;
      return true;
    })
    .slice(0, MAX_FLIGHTS)
    .map((f: any) => ({
      callsign: ((f.flight || '') as string).trim().toUpperCase() || f.hex || 'UNKNOWN',
      lat: Math.round((f.lat as number) * 100000) / 100000,
      lng: Math.round((f.lon as number) * 100000) / 100000,
      alt: typeof f.alt_baro === 'number' ? Math.round((f.alt_baro as number) * 0.3048) : 0,
      heading: Math.round((f.track || 0) as number),
      speed_knots: typeof f.gs === 'number' ? Math.round((f.gs as number) * 10) / 10 : null,
      model: f.t || 'Unknown',
      icao24: f.hex || '',
      registration: f.r || 'N/A',
      squawk: f.squawk || '',
      type: 'cargo_flight',
    }));

  const response = { flights, total: flights.length, updatedAt: new Date().toISOString() };
  cachedResponse = response;
  lastFetch = now;

  return Response.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=25, stale-while-revalidate=120',
      'CDN-Cache-Control': 'public, s-maxage=25',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=25',
    },
  });
}
