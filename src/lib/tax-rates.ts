"use client";

import taxRatesData from "@/data/aliquotas-importacao.json";

export interface TaxRate {
  ncm: string;
  descricao: string;
  ii?: number;
  ipi?: number;
  pis?: number;
  cofins?: number;
  icms?: number;
  tecc?: number;
  cide?: number;
  origem?: string;
  unidade?: string;
}

/**
 * Busca alíquotas de importação por código NCM
 */
export const findTaxRatesByNcm = async (ncm: string): Promise<TaxRate | null> => {
  if (!ncm) return null;
  
  // Normalize NCM (remove punctuation)
  const normalizedNcm = ncm.replace(/\D/g, '');
  
  // Search in the imported data
  const rates = taxRatesData as TaxRate[];
  const result = rates.find((item) => {
    const itemNcm = item.ncm?.replace(/\D/g, '');
    return itemNcm === normalizedNcm;
  });
  
  return result || null;
};

/**
 * Busca alíquotas por descrição (busca aproximada)
 */
export const findTaxRatesByDescription = async (searchTerm: string): Promise<TaxRate[]> => {
  if (!searchTerm) return [];
  
  const rates = taxRatesData as TaxRate[];
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return rates
    .filter((item) => 
      item.descricao?.toLowerCase().includes(normalizedSearch)
    )
    .slice(0, 50); // Limit results
};

/**
 * Calcula o total de impostos para um produto importado
 */
export const calculateTotalImportTax = (rates: TaxRate, productValue: number): {
  total: number;
  breakdown: Record<string, number>;
} => {
  const breakdown: Record<string, number> = {
    ii: rates.ii ? (productValue * rates.ii / 100) : 0,
    ipi: rates.ipi ? (productValue * rates.ipi / 100) : 0,
    pis: rates.pis ? (productValue * rates.pis / 100) : 0,
    cofins: rates.cofins ? (productValue * rates.cofins / 100) : 0,
    icms: rates.icms ? (productValue * rates.icms / 100) : 0,
  };
  
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return { total, breakdown };
};

/**
 * Formata alíquota para exibição
 */
export const formatTaxRate = (rate?: number): string => {
  if (rate === undefined || rate === null) return "—";
  return `${rate.toFixed(2)}%`;
};