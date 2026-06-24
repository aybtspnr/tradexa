import { useState, useEffect, useCallback } from 'react';
import { comexstat } from '@/services/comexstat';

interface AlertaConfig {
  ncm: string;
  paises?: string[];
  threshold?: number;
}

interface Alerta {
  id: string;
  tipo: 'alta' | 'novo_destino' | 'queda_concorrente' | 'sazonal';
  titulo: string;
  descricao: string;
  ncm: string;
  pais: string;
  fobAtual: number;
  fobAnterior: number;
  variacao: number;
  dadosExtras?: any;
}

const STORAGE_KEY = 'tradexa_alertas_config';

export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<AlertaConfig[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const saveConfigs = (newConfigs: AlertaConfig[]) => {
    setConfigs(newConfigs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
  };

  const addConfig = (config: AlertaConfig) => {
    saveConfigs([...configs, config]);
  };

  const removeConfig = (index: number) => {
    saveConfigs(configs.filter((_, i) => i !== index));
  };

  const detectarOportunidades = useCallback(async () => {
    if (configs.length === 0) return;
    setLoading(true);
    const novosAlertas: Alerta[] = [];

    try {
      for (const config of configs) {
        const now = new Date();
        const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const mesAnterior = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

        // Tipo 1: Mercado em alta
        const bodyAtual: any = {
          flow: 'export',
          monthDetail: false,
          period: { from: mesAtual, to: mesAtual },
          details: ['country'],
          metrics: ['metricFOB'],
        };
        if (config.ncm) bodyAtual.filters = [{ filter: 'ncm', values: [config.ncm] }];

        const bodyAnterior = { ...bodyAtual, period: { from: mesAnterior, to: mesAnterior } };

        const [dataAtual, dataAnterior] = await Promise.all([
          comexstat.queryGeneral(bodyAtual).catch(() => null),
          comexstat.queryGeneral(bodyAnterior).catch(() => null),
        ]);

        if (dataAtual && dataAnterior) {
          const paisesAtual = dataAtual?.data || [];
          const paisesAnterior = dataAnterior?.data || [];

          for (const pais of paisesAtual) {
            const anterior = paisesAnterior.find((p: any) => p.country === pais.country);
            const fobAtual = pais.metricFOB || 0;
            const fobAnterior = anterior?.metricFOB || 0;
            const variacao = fobAnterior > 0 ? ((fobAtual - fobAnterior) / fobAnterior) * 100 : 100;

            if (variacao > (config.threshold || 20)) {
              novosAlertas.push({
                id: `alta-${pais.country}-${Date.now()}`,
                tipo: 'alta',
                titulo: 'Mercado em alta',
                descricao: `Exportações para ${pais.country} cresceram ${variacao.toFixed(1)}%`,
                ncm: config.ncm,
                pais: pais.country,
                fobAtual,
                fobAnterior,
                variacao,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[useAlertas] Erro ao detectar:', err);
    }

    setAlertas(novosAlertas);
    setLoading(false);
  }, [configs]);

  return {
    alertas,
    loading,
    configs,
    addConfig,
    removeConfig,
    detectarOportunidades,
  };
}