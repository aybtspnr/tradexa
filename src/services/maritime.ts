import { getCached } from './cache';
import { proxyUrl } from './apiProxy';

// Datalastic API (requer API key)
const DATALASTIC_KEY = import.meta.env.VITE_DATALASTIC_API_KEY || '';

interface VesselInfo {
  vesselName: string;
  status: string;
  eta: string;
  origin: string;
  destination: string;
  imo?: string;
  trackingUrl?: string;
}

// Mapeamento de URFs brasileiros para portos
export const URF_PORTS: Record<string, { port: string; uf: string; lat: number; lon: number }> = {
  'RS00': { port: 'Porto de Rio Grande', uf: 'RS', lat: -29.98, lon: -51.18 },
  'SP01': { port: 'Porto de Santos', uf: 'SP', lat: -23.96, lon: -46.31 },
  'PR00': { port: 'Porto de Paranaguá', uf: 'PR', lat: -25.50, lon: -48.51 },
  'SC00': { port: 'Porto de Itajaí', uf: 'SC', lat: -26.90, lon: -48.66 },
  'ES00': { port: 'Porto de Vitória', uf: 'ES', lat: -20.32, lon: -40.35 },
  'PE00': { port: 'Porto de Suape', uf: 'PE', lat: -8.39, lon: -34.96 },
  'PI00': { port: 'Porto de Parnaíba', uf: 'PI', lat: -2.90, lon: -41.77 },
  'AL00': { port: 'Porto de Maceió', uf: 'AL', lat: -9.65, lon: -35.73 },
  'BA00': { port: 'Porto de Salvador', uf: 'BA', lat: -12.97, lon: -38.51 },
  'RJ00': { port: 'Porto de Rio de Janeiro', uf: 'RJ', lat: -22.90, lon: -43.17 },
  'PA00': { port: 'Porto de Belém', uf: 'PA', lat: -1.44, lon: -48.49 },
  'CE00': { port: 'Porto de Fortaleza', uf: 'CE', lat: -3.73, lon: -38.53 },
  'MA00': { port: 'Porto de São Luís', uf: 'MA', lat: -2.53, lon: -44.30 },
  'SE00': { port: 'Porto de Aracaju', uf: 'SE', lat: -10.91, lon: -37.07 },
};

export const DEST_PORTS: Record<string, string> = {
  US: 'Port of Los Angeles',
  CN: 'Port of Shanghai',
  AR: 'Port of Buenos Aires',
  DE: 'Port of Hamburg',
  IT: 'Port of Genoa',
  FR: 'Port of Marseille',
  JP: 'Port of Yokohama',
  GB: 'Port of London Gateway',
  BE: 'Port of Antwerp-Bruges',
  CA: 'Port of Vancouver',
  CL: 'Port of Valparaíso',
  MX: 'Port of Manzanillo',
  AU: 'Port of Melbourne',
  PE: 'Port of Callao',
  PT: 'Port of Lisbon',
  DO: 'Port of Caucedo',
  TW: 'Port of Kaohsiung',
  HK: 'Port of Hong Kong',
  ZA: 'Port of Cape Town',
  KR: 'Port of Busan',
  DK: 'Port of Aarhus',
  ES: 'Port of Valencia',
  FI: 'Port of Helsinki',
  NO: 'Port of Oslo',
  RU: 'Port of St. Petersburg',
  SE: 'Port of Gothenburg',
  CH: 'Port of Basel',
  NL: 'Port of Rotterdam',
  UY: 'Port of Montevideo',
  VE: 'Port of La Guaira',
  SA: 'Jeddah Islamic Port',
  DZ: 'Port of Algiers',
  BD: 'Port of Chittagong',
  IN: 'Port of Mumbai',
  TH: 'Port of Bangkok',
  SG: 'Port of Singapore',
  AE: 'Jebel Ali Port (Dubai)',
  TR: 'Port of Istanbul',
  ID: 'TanJungPriok (Jakarta)',
  EG: 'Port Said',
  NG: 'Lagos Port Complex',
  KE: 'Port of Mombasa',
  VN: 'Port of Haiphong',
};

async function tryDatalastic(imo: string): Promise<VesselInfo | null> {
  if (!DATALASTIC_KEY) return null;
  try {
    const url = proxyUrl("datalastic", `vessel_info?api_key=${DATALASTIC_KEY}&imo_number=${imo}`);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const v = data?.data?.[0];
    if (!v) return null;
    return {
      vesselName: v.vessel_name || 'Unknown',
      status: v.navigational_status || 'In Transit',
      eta: v.eta || 'N/A',
      origin: v.zone_name || 'Brazil',
      destination: v.port_name || 'Unknown',
      imo,
      trackingUrl: `https://www.vesselfinder.com/?imo=${imo}`,
    };
  } catch {
    return null;
  }
}

export async function getVesselInfo(urf: string, paisDestino: string): Promise<VesselInfo | null> {
  // Sem API key ou IMO real, não retorna dados simulados
  if (!DATALASTIC_KEY) return null;
  // Precisaríamos de um IMO real para consultar — sem isso não há dados
  return null;
}

export async function getVesselsByURF(urf: string, limit = 5): Promise<VesselInfo[]> {
  // Sem fonte real de dados, retorna vazio
  return [];
}