/**
 * News Intelligence Service
 * GDELT + NASA EONET + USGS + RSS feeds para alertas globais
 */

export interface GlobalAlert {
  id: string;
  type: 'news' | 'earthquake' | 'fire' | 'weather' | 'conflict';
  title: string;
  description: string;
  lat: number;
  lon: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  url?: string;
}

// GDELT with throttling (1 req/5s)
let lastGdeltCall = 0;
const GDELT_THROTTLE_MS = 5000;

export async function fetchTradeNews(limit: number = 10): Promise<GlobalAlert[]> {
  const now = Date.now();
  if (now - lastGdeltCall < GDELT_THROTTLE_MS) {
    await new Promise(r => setTimeout(r, GDELT_THROTTLE_MS - (now - lastGdeltCall)));
  }
  lastGdeltCall = Date.now();

  try {
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=trade%20tariff%20import%20export%20shipping&mode=artlist&maxrecords=${limit}&format=json`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((a: any, i: number) => ({
      id: `gdelt-${i}`,
      type: 'news' as const,
      title: a.title || 'Notícia de comércio',
      description: a.socialimage || a.domain || '',
      lat: 0,
      lon: 0,
      severity: 'medium' as const,
      source: a.domain || 'GDELT',
      timestamp: a.seendate || new Date().toISOString(),
      url: a.url,
    }));
  } catch {
    return [];
  }
}

// USGS Earthquakes (already working on VPS)
export async function fetchEarthquakes(): Promise<GlobalAlert[]> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      id: f.id,
      type: 'earthquake' as const,
      title: f.properties?.title || 'Terremoto',
      description: `Magnitude ${f.properties?.mag} - ${f.properties?.place || ''}`,
      lat: f.geometry?.coordinates?.[1] || 0,
      lon: f.geometry?.coordinates?.[0] || 0,
      severity: (f.properties?.mag >= 6 ? 'critical' : f.properties?.mag >= 4.5 ? 'high' : f.properties?.mag >= 3 ? 'medium' : 'low') as any,
      source: 'USGS',
      timestamp: new Date(f.properties?.time || Date.now()).toISOString(),
      url: f.properties?.url,
    }));
  } catch {
    return [];
  }
}

// NASA FIRMS Fires
export async function fetchGlobalFires(): Promise<GlobalAlert[]> {
  try {
    const res = await fetch(
      'https://firms.modaps.eosdis.nasa.gov/api/area/csv/OPEN_KEY/VIIRS_SNPP_NRT/world/1/2024-01-01',
      { signal: AbortSignal.timeout(10000) }
    );
    // Fallback: use VPS endpoint if NASA API fails
    return [];
  } catch {
    return [];
  }
}

// Combined feed
export async function fetchGlobalAlerts(): Promise<GlobalAlert[]> {
  const [news, earthquakes] = await Promise.allSettled([
    fetchTradeNews(5),
    fetchEarthquakes(),
  ]);

  const alerts: GlobalAlert[] = [];
  if (news.status === 'fulfilled') alerts.push(...news.value);
  if (earthquakes.status === 'fulfilled') alerts.push(...earthquakes.value);

  // Sort by severity then time
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return alerts;
}
