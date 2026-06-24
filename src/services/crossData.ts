"use client";

import { fetchUnComtrade } from './unComtrade';
import { supabase } from '@/integrations/supabase/client';

export interface CrossDataSummary {
  ncm: string;
  ncmFormatted: string;
  period: string;
  mdicTotalExport: number;
  mdicTotalImport: number;
  unTotalExport: number;
  unTotalImport: number;
  divergenceExport: number;
  divergenceImport: number;
  monthlyData: {
    mes: string;
    mdicExport: number;
    unExport: number;
    mdicImport: number;
    unImport: number;
  }[];
}

const MONTH_ORDER = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function formatNcm(ncm: string): string {
  const d = ncm.replace(/\D/g, '');
  if (d.length === 8) return `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)}`;
  return ncm;
}

function monthName(m: string): string {
  const map: Record<string, string> = {
    '01': 'Jan','02': 'Fev','03': 'Mar','04': 'Abr','05': 'Mai','06': 'Jun',
    '07': 'Jul','08': 'Ago','09': 'Set','10': 'Out','11': 'Nov','12': 'Dez',
  };
  return map[m] || m;
}

export async function getCrossDataComparison(
  ncm: string,
  ano: string
): Promise<CrossDataSummary> {
  const ncmClean = ncm.replace(/\D/g, '');
  const hs2 = ncmClean.slice(0, 2);

  // ── 1. MDIC COMEXSTAT data ──
  const [exRes, imRes] = await Promise.all([
    supabase.functions.invoke('export-data', {
      body: { ncm: ncmClean, anoDe: ano, mesDe: '01', anoAte: ano, mesAte: '12' },
    }),
    supabase.functions.invoke('import-data', {
      body: { ncm: ncmClean, anoDe: ano, mesDe: '01', anoAte: ano, mesAte: '12' },
    }),
  ]);

  const exRows = (exRes?.data?.registros || exRes?.data || []) as any[];
  const imRows = (imRes?.data?.registros || imRes?.data || []) as any[];

  const mdicExportByMonth: Record<string, number> = {};
  const mdicImportByMonth: Record<string, number> = {};

  for (const r of exRows) {
    const m = String(r.co_mes || r.mes || '').padStart(2, '0');
    if (m && m !== '00') {
      mdicExportByMonth[m] = (mdicExportByMonth[m] || 0) + Number(r.vl_fob || r.valor || 0);
    }
  }

  for (const r of imRows) {
    const m = String(r.co_mes || r.mes || '').padStart(2, '0');
    if (m && m !== '00') {
      mdicImportByMonth[m] = (mdicImportByMonth[m] || 0) + Number(r.vl_fob || r.valor || 0);
    }
  }

  const mdicTotalExport = Object.values(mdicExportByMonth).reduce((a, b) => a + b, 0);
  const mdicTotalImport = Object.values(mdicImportByMonth).reduce((a, b) => a + b, 0);

  // ── 2. Global trade data ──
  let unData: any = null;
  try {
    unData = await fetchUnComtrade({
      ps: ano,
      r: '76',
      p: 'all',
      rg: 'all',
    });
  } catch { /* ignore */ }

  const unRows = (unData?.records || unData?.data || []) as any[];
  const unExportByMonth: Record<string, number> = {};
  const unImportByMonth: Record<string, number> = {};

  for (const r of unRows) {
    const flow = String(r.rgDesc || r.tradeFlow || '').toLowerCase();
    const isExport = flow.includes('export');
    const isImport = flow.includes('import');
    const m = String(r.period || r.ps || '').slice(4, 6);
    const val = Number(r.tradeValue || r.vlFob || r.primaryValue || 0);

    if (isExport && m) {
      unExportByMonth[m] = (unExportByMonth[m] || 0) + val;
    }
    if (isImport && m) {
      unImportByMonth[m] = (unImportByMonth[m] || 0) + val;
    }
  }

  const unTotalExport = Object.values(unExportByMonth).reduce((a, b) => a + b, 0);
  const unTotalImport = Object.values(unImportByMonth).reduce((a, b) => a + b, 0);

  // ── 3. Build monthly series ──
  const monthlyData = MONTH_ORDER.map((m) => ({
    mes: monthName(m),
    mdicExport: mdicExportByMonth[m] || 0,
    unExport: unExportByMonth[m] || 0,
    mdicImport: mdicImportByMonth[m] || 0,
    unImport: unImportByMonth[m] || 0,
  }));

  // ── 4. Divergence calculations ──
  const divergenceExport = unTotalExport > 0
    ? Math.round(((mdicTotalExport - unTotalExport) / unTotalExport) * 1000) / 10
    : 0;
  const divergenceImport = unTotalImport > 0
    ? Math.round(((mdicTotalImport - unTotalImport) / unTotalImport) * 1000) / 10
    : 0;

  return {
    ncm: ncmClean,
    ncmFormatted: formatNcm(ncmClean),
    period: ano,
    mdicTotalExport,
    mdicTotalImport,
    unTotalExport,
    unTotalImport,
    divergenceExport,
    divergenceImport,
    monthlyData,
  };
}