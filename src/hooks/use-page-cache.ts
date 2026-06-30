"use client";

/**
 * usePageCache — persiste estado de página no localStorage
 * para sobreviver a descarte de aba pelo navegador (tab discard).
 *
 * Uso:
 *   const cache = usePageCache<MeuTipo>('meu-pagina');
 *   const saved = cache.restore(); // null se não tem cache
 *   cache.save({ termo, resultados, pagina }); // salva
 *   cache.clear(); // limpa cache específico
 */

const CACHE_PREFIX = "tradexa_pc_";

export function usePageCache<T>(pageKey: string) {
  const storageKey = `${CACHE_PREFIX}${pageKey}`;

  const save = (data: T): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("[usePageCache] Falha ao salvar:", e);
    }
  };

  const restore = (): T | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const clear = (): void => {
    localStorage.removeItem(storageKey);
  };

  return { save, restore, clear };
}
