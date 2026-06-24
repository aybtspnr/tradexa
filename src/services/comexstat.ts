import { getCached, postCached } from './cache';
import { proxyUrl } from './apiProxy';

export const comexstat = {
  // Dados gerais de exportação
  queryGeneral: (body: any) => postCached(proxyUrl("comexstat", "general"), body),

  // Dados por município
  queryCities: (body: any) => postCached(proxyUrl("comexstat", "cities"), body),

  // Tabelas de referência
  getCountries: () => getCached(proxyUrl("comexstat", "tables/countries")),
  getCities: () => getCached(proxyUrl("comexstat", "tables/cities")),
  getUFs: () => getCached(proxyUrl("comexstat", "tables/uf")),
  getURFs: () => getCached(proxyUrl("comexstat", "tables/urf")),

  // Busca de NCM por texto
  searchNCM: (term: string) => getCached(proxyUrl("comexstat", `tables/ncm?search=${encodeURIComponent(term)}&language=pt`)),

  // Filtros disponíveis
  getGeneralFilters: () => getCached(proxyUrl("comexstat", "general/filters")),
  getGeneralFilterValues: (filter: string) => getCached(proxyUrl("comexstat", `general/filters/${filter}`)),
  getCitiesFilters: () => getCached(proxyUrl("comexstat", "cities/filters")),
  getCitiesFilterValues: (filter: string) => getCached(proxyUrl("comexstat", `cities/filters/${filter}`)),

  // Datas
  getLastUpdate: () => getCached(proxyUrl("comexstat", "general/dates/updated")),
  getAvailableYears: () => getCached(proxyUrl("comexstat", "general/dates/years")),
};

// Mapeamento NCM capítulo → CNAE
export const NCM_TO_CNAE: Record<string, string> = {
  '01': '01', '02': '01', '03': '01', '04': '01', '05': '01',
  '06': '01', '07': '01', '08': '01', '09': '01', '10': '01',
  '11': '01', '12': '01', '13': '01', '14': '01',
  '15': '1040',
  '16': '1013',
  '17': '1060', '18': '1060', '19': '1060',
  '22': '1110',
  '27': '0600',
  '28': '2010', '29': '2010',
  '30': '2110',
  '40': '2219',
  '44': '1610',
  '47': '1710', '48': '1710',
  '50': '1311', '51': '1311', '52': '1311', '53': '1311',
  '54': '1311', '55': '1311', '56': '1311', '57': '1311',
  '58': '1311', '59': '1311', '60': '1311', '61': '1311',
  '62': '1311', '63': '1311',
  '72': '2410', '73': '2410',
  '84': '2800', '85': '2800',
  '87': '2910',
};

export function getCnaeFromNcm(ncm: string): string | null {
  const chapter = ncm.replace(/\D/g, '').substring(0, 2);
  return NCM_TO_CNAE[chapter] || null;
}

// Mapeamento de códigos numéricos do Dados Oficiais para ISO2
export const COUNTRY_NUM_TO_ISO2: Record<string, string> = {
  '249': 'US', // EUA
  '300': 'US', // EUA (alternativo)
  '243': 'CN', // China
  '160': 'AR', // Argentina
  '105': 'DE', // Alemanha
  '400': 'IT', // Itália
  '309': 'FR', // França
  '411': 'JP', // Japão
  '538': 'GB', // Reino Unido
  '196': 'BE', // Bélgica
  '226': 'CA', // Canadá
  '239': 'CL', // Chile
  '452': 'MX', // México
  '169': 'AU', // Austrália
  '507': 'PE', // Peru
  '531': 'PT', // Portugal
  '548': 'DO', // Rep. Dominicana
  '586': 'TW', // Taiwan
  '358': 'HK', // Hong Kong
  '063': 'ZA', // África do Sul
  '267': 'KR', // Coreia do Sul
  '280': 'DK', // Dinamarca
  '291': 'ES', // Espanha
  '305': 'FI', // Finlândia
  '474': 'NO', // Noruega
  '566': 'RU', // Rússia
  '575': 'SE', // Suécia
  '578': 'CH', // Suíça
  '589': 'NL', // Países Baixos
  '699': 'UY', // Uruguai
  '845': 'VE', // Venezuela
  '023': 'AD', // Andorra
  '037': 'SA', // Arábia Saudita
  '040': 'DZ', // Argélia
  '042': 'AM', // Arménia
  '045': 'AZ', // Azerbaijão
  '060': 'BS', // Bahamas
  '072': 'BD', // Bangladesh
  '097': 'XX', // Não declarado
};