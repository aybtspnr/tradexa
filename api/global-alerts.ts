/**
 * Vercel serverless — Global Alerts (GDELT + USGS)
 * Endpoint: /api/global-alerts
 */

interface GlobalAlert {
  id: string;
  type: 'news' | 'earthquake';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  url?: string;
}

let cached: GlobalAlert[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 300000; // 5 min

async function fetchTradeNews(limit: number = 10): Promise<GlobalAlert[]> {
  try {
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=trade%20tariff%20import%20export%20shipping&mode=artlist&maxrecords=${limit}&format=json`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.articles || []).map((a: any, i: number) => ({
      id: `gdelt-${i}`,
      type: 'news' as const,
      title: a.title || 'Notícia de comércio',
      description: a.domain || '',
      severity: 'medium' as const,
      source: a.domain || 'GDELT',
      timestamp: a.seendate || new Date().toISOString(),
      url: a.url,
    }));
  } catch {
    return [];
  }
}

async function fetchEarthquakes(): Promise<GlobalAlert[]> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.features || []).map((f: any) => {
      const mag = f.properties?.mag || 0;
      return {
        id: f.id,
        type: 'earthquake' as const,
        title: f.properties?.title || 'Terremoto',
        description: `Magnitude ${mag} - ${f.properties?.place || ''}`,
        severity: (mag >= 6 ? 'critical' : mag >= 4.5 ? 'high' : mag >= 3 ? 'medium' : 'low') as any,
        source: 'USGS',
        timestamp: new Date(f.properties?.time || Date.now()).toISOString(),
        url: f.properties?.url,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return Response.json({ alerts: cached, updatedAt: new Date(lastFetch).toISOString() });
  }

  const [news, earthquakes] = await Promise.allSettled([
    fetchTradeNews(5),
    fetchEarthquakes(),
  ]);

  const alerts: GlobalAlert[] = [];
  if (news.status === 'fulfilled') alerts.push(...news.value);
  if (earthquakes.status === 'fulfilled') alerts.push(...earthquakes.value);

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (alerts.length > 0) {
    cached = alerts;
    lastFetch = now;
  }

  return Response.json({ alerts: cached || alerts, updatedAt: new Date().toISOString() });
}
