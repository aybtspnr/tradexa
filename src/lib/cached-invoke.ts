/**
 * Wrapper para supabase.functions.invoke com cache em sessionStorage.
 * Aceita os mesmos parâmetros que supabase.functions.invoke:
 *   cachedInvoke(fnName, { body, headers })
 * Evita chamadas duplicadas na mesma sessão e reduz 429 do Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "tradexa_fn_";

interface CacheEntry {
  data: any;
  error: any | null;
  ts: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutos

export async function cachedInvoke(
  fnName: string,
  options: { body?: unknown; headers?: Record<string, string> } = {},
  ttlMs: number = TTL_MS,
): Promise<{ data: any; error: any | null }> {
  const body = options?.body || {};
  const headers = options?.headers || {};

  // Gera chave de cache baseada no nome + body
  const bodyKey = JSON.stringify(body);
  const cacheKey = CACHE_PREFIX + fnName + "_" + hashString(bodyKey);

  // Tenta cache
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.ts < ttlMs) {
        return { data: entry.data, error: entry.error };
      }
    }
  } catch {}

  // Faz a chamada real
  const result = await supabase.functions.invoke(fnName, { body, headers });

  // Salva no cache
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ data: result.data, error: result.error, ts: Date.now() }),
    );
  } catch {}

  return result;
}

/** Simple string hash for cache keys */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
