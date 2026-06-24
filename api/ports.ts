/**
 * Vercel serverless — World Port Index via ArcGIS (3,630 ports worldwide)
 * Endpoint: /api/ports
 * Cached for 1h. Uses pagination to fetch all ports (ArcGIS limits 2000/request).
 */

const ARCGIS_URL = "https://services-eu1.arcgis.com/BuS9rtTsYEV5C0xh/arcgis/rest/services/World_Port_Index/FeatureServer/0/query";

let cached: any = null;
let lastFetch = 0;
const CACHE_TTL = 3600000; // 1h
const PAGE_SIZE = 2000; // ArcGIS max per request

async function fetchPortsPage(offset: number): Promise<any[]> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "PORT_NAME,COUNTRY,LATITUDE,LONGITUDE,INDEX_NO",
    returnGeometry: "false",
    resultRecordCount: String(PAGE_SIZE),
    resultOffset: String(offset),
    f: "json",
  });

  const res = await fetch(`${ARCGIS_URL}?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`ArcGIS returned ${res.status}`);
  const data = await res.json() as any;

  return (data.features || []).map((f: any) => ({
    name: f.attributes?.PORT_NAME || "Unknown",
    country: f.attributes?.COUNTRY || "??",
    lat: f.attributes?.LATITUDE,
    lng: f.attributes?.LONGITUDE,
    index: f.attributes?.INDEX_NO,
  })).filter((p: any) => p.lat && p.lng);
}

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return Response.json(cached);
  }

  try {
    const allPorts: any[] = [];
    let offset = 0;

    while (true) {
      const page = await fetchPortsPage(offset);
      allPorts.push(...page);
      if (page.length < PAGE_SIZE) break; // Last page
      offset += PAGE_SIZE;
    }

    cached = allPorts;
    lastFetch = now;
    return Response.json(allPorts);
  } catch (e) {
    if (cached) return Response.json(cached);
    return Response.json([]);
  }
}
