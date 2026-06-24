import { useState, useEffect, useCallback } from 'react';
import { comexstat } from '@/services/comexstat';

interface UseComexstatOptions {
  enabled?: boolean;
}

export function useComexstatGeneral(body: any, options: UseComexstatOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await comexstat.queryGeneral(body);
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(body), enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useComexstatCities(body: any, options: UseComexstatOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await comexstat.queryCities(body);
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(body), enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}