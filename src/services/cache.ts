const memCache = new Map<string, { data: any; ts: number }>();

export async function getCached(url: string, ttl = 3600000): Promise<any> {
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  memCache.set(url, { data, ts: Date.now() });
  return data;
}

export async function postCached(url: string, body: any, ttl = 300000): Promise<any> {
  const key = url + JSON.stringify(body);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  memCache.set(key, { data, ts: Date.now() });
  return data;
}

export function clearCache() {
  memCache.clear();
}