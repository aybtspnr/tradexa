const memCache = new Map<string, { data: any; ts: number }>();

const RETRY_DELAYS = [3000, 8000, 15000]; // 3s, 8s, 15s

// localStorage prefix to avoid collisions
const LS_PREFIX = 'api_cache_';

function getLSCache(): Record<string, { data: any; ts: number }> {
  try {
    const raw = localStorage.getItem(LS_PREFIX + 'store');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLSCache(store: Record<string, { data: any; ts: number }>) {
  try {
    localStorage.setItem(LS_PREFIX + 'store', JSON.stringify(store));
  } catch {
    // localStorage may be full (quota exceeded), ignore silently
  }
}

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
  // 1. Check in-memory cache (fastest)
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;

  // 2. Check localStorage (survives tab switch reload)
  const lsStore = getLSCache();
  const lsCached = lsStore[url];
  if (lsCached && Date.now() - lsCached.ts < ttl) {
    // Restore to in-memory cache too
    memCache.set(url, lsCached);
    return lsCached.data;
  }

  // 3. Fetch fresh data
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const entry = { data, ts: Date.now() };
  memCache.set(url, entry);
  const ssStore = getLSCache();
  ssStore[url] = entry;
  setLSCache(ssStore);
  return data;
}

export async function postCached(url: string, body: any, ttl = 300000): Promise<any> {
  const key = url + JSON.stringify(body);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;

  // Check localStorage
  const lsStore = getLSCache();
  const lsCached = lsStore[key];
  if (lsCached && Date.now() - lsCached.ts < ttl) {
    memCache.set(key, lsCached);
    return lsCached.data;
  }

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const entry = { data, ts: Date.now() };
  memCache.set(key, entry);
  const store = getLSCache();
  store[key] = entry;
  setLSCache(store);
  return data;
}

export function clearCache() {
  memCache.clear();
  try { localStorage.removeItem(LS_PREFIX + 'store'); } catch {}
}
