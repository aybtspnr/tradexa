const memCache = new Map<string, { data: any; ts: number }>();

const RETRY_DELAYS = [3000, 8000, 15000]; // 3s, 8s, 15s

async function fetchWithRetry(url: string, options?: RequestInit, retries = RETRY_DELAYS): Promise<Response> {
  for (let i = 0; i <= retries.length; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429 || i === retries.length) return res;
    // Rate limited — wait and retry
    await new Promise(r => setTimeout(r, retries[i]));
  }
  return fetch(url, options); // unreachable, but satisfies TS
}

export async function getCached(url: string, ttl = 3600000): Promise<any> {
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  memCache.set(url, { data, ts: Date.now() });
  return data;
}

export async function postCached(url: string, body: any, ttl = 300000): Promise<any> {
  const key = url + JSON.stringify(body);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetchWithRetry(url, {
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