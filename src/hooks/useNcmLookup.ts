import { useState, useCallback } from 'react';
import { buscarNcmAuto, NcmResult } from '@/utils/ncmQuery';

export function useNcmLookup() {
  const [result, setResult] = useState<NcmResult | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (ncm: string) => {
    if (!ncm) return;
    setLoading(true);
    const r = await buscarNcmAuto(ncm);
    setResult(r);
    setLoading(false);
    return r;
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setLoading(false);
  }, []);

  return { result, loading, search, clear };
}
