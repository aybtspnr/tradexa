import { useState, useEffect } from 'react';
import { comexstat } from '@/services/comexstat';

interface SetorComparison {
  mediaSetor: number;
  valorUsuario: number;
  posicaoRelativa: number;
  acimaMedia: boolean;
  totalSetor: number;
  loading: boolean;
}

export function useSetorComparison(ncm: string, valorUsuario: number, periodo: { from: string; to: string }): SetorComparison {
  const [mediaSetor, setMediaSetor] = useState(0);
  const [totalSetor, setTotalSetor] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ncm || ncm.length < 2) return;

    const chapter = ncm.replace(/\D/g, '').substring(0, 2);
    setLoading(true);

    comexstat.queryGeneral({
      flow: 'export',
      monthDetail: false,
      period: periodo,
      filters: [{ filter: 'ncm', values: [chapter] }],
      details: ['state'],
      metrics: ['metricFOB'],
    })
      .then((data) => {
        const registros = data?.data || [];
        const total = registros.reduce((sum: number, r: any) => sum + (r.metricFOB || 0), 0);
        setTotalSetor(total);
        setMediaSetor(registros.length > 0 ? total / registros.length : 0);
      })
      .catch(() => {
        setMediaSetor(0);
        setTotalSetor(0);
      })
      .finally(() => setLoading(false));
  }, [ncm, periodo.from, periodo.to]);

  const posicaoRelativa = mediaSetor > 0 ? ((valorUsuario / mediaSetor) - 1) * 100 : 0;

  return {
    mediaSetor,
    valorUsuario,
    posicaoRelativa,
    acimaMedia: posicaoRelativa > 0,
    totalSetor,
    loading,
  };
}