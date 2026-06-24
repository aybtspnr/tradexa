import { supabase } from "@/integrations/supabase/client";

export interface NcmResult {
  data: any[] | null;
  usedFormat: '8' | '4' | 'none';
  error: any;
  queryTime: string;
}

/**
 * Busca NCM tentando 8 dígitos (posição) primeiro, depois 4 (capítulo).
 * Limpa pontuação, preenche zeros à esquerda automaticamente.
 */
export async function buscarNcmAuto(ncmRaw: string | number): Promise<NcmResult> {
  const base = String(ncmRaw).replace(/\D/g, '');
  const ncm8 = base.padStart(8, '0').slice(0, 8);
  const ncm4 = base.slice(0, 4).padStart(4, '0');

  const start = performance.now();
  let usedFormat: '8' | '4' | 'none' = '8';

  // Tentativa 1 — 8 dígitos (posição completa)
  let { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('ncm_code', ncm8)
    .limit(20);

  // Tentativa 2 — 4 dígitos (capítulo)
  if ((!data || data.length === 0) && ncm4 !== ncm8) {
    const res4 = await supabase
      .from('products')
      .select('*')
      .eq('ncm_code', ncm4)
      .limit(20);
    data = res4.data;
    error = res4.error;
    usedFormat = '4';
  }

  if (!data || data.length === 0) usedFormat = 'none';

  return { data, usedFormat, error, queryTime: `${(performance.now() - start).toFixed(1)}ms` };
}

/** Formata para exibição: 8482.00.00 */
export function formatNcmDisplay(raw: string | number) {
  const s = String(raw).replace(/\D/g, '').padStart(8, '0');
  return `${s.slice(0,4)}.${s.slice(4,6)}.${s.slice(6,8)}`;
}

/** Badge do formato usado */
export const ncmBadge = (used: '8'|'4'|'none') => {
  if (used === '8') return { label: '8 dígitos', cls: 'bg-blue-500/20 text-amber-300 border-blue-500/30', desc: 'Posição completa (NCM 8)' };
  if (used === '4') return { label: '4 dígitos', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30', desc: 'Capítulo NCM 4' };
  return { label: 'Não encontrado', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: 'Sem resultados' };
};
