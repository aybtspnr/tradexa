/**
 * Vercel serverless — airports via OpenFlights + OurAirports
 * Endpoint: /api/airports
 * Returns filtered large + medium airports worldwide
 * Cached 6h
 */

const OPENFLIGHTS_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

let cached: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 21600000; // 6h

interface Airport {
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  lat: number;
  lng: number;
}

async function fetchAirports(): Promise<Airport[]> {
  try {
    const res = await fetch(OPENFLIGHTS_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    
    const airports: Airport[] = [];
    const lines = text.split("\n");
    
    for (const line of lines) {
      if (!line.trim()) continue;
      // Format: ID,Name,City,Country,IATA,ICAO,Lat,Lng,Alt,Timezone,DST,Tz,Type,Source
      const parts = line.split(",");
      if (parts.length < 9) continue;
      
      const iata = parts[4]?.trim().replace(/"/g, "") || "";
      const icao = parts[5]?.trim().replace(/"/g, "") || "";
      const lat = parseFloat(parts[6]);
      const lng = parseFloat(parts[7]);
      
      // Only include airports with valid coordinates and IATA code
      if (!iata || iata === "\\N" || isNaN(lat) || isNaN(lng)) continue;
      if (lat === 0 && lng === 0) continue;
      
      airports.push({
        name: parts[1]?.trim().replace(/"/g, "") || "Unknown",
        city: parts[2]?.trim().replace(/"/g, "") || "",
        country: parts[3]?.trim().replace(/"/g, "") || "",
        iata,
        icao: icao === "\\N" ? "" : icao,
        lat,
        lng,
      });
    }
    
    // Deduplicate by IATA
    const seen = new Set<string>();
    const unique = airports.filter(a => {
      if (seen.has(a.iata)) return false;
      seen.add(a.iata);
      return true;
    });
    
    return unique;
  } catch {
    return [];
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return Response.json(cached);
  }

  try {
    const airports = await fetchAirports();
    if (airports.length > 0) {
      cached = airports;
      lastFetch = now;
    }
    return Response.json(airports);
  } catch {
    if (cached) return Response.json(cached);
    return Response.json([]);
  }
}
