import { getCached } from './cache';
import { proxyUrl } from './apiProxy';

const SEARATES_KEY = import.meta.env.VITE_SEARATES_API_KEY || '';

export interface VesselTracking {
  vesselName: string;
  imo?: string;
  status: string;
  origin: string;
  destination: string;
  eta: string;
  trackingUrl?: string;
  latitude?: number;
  longitude?: number;
}

// Mapeamento de URFs brasileiros para portos
const URF_PORTS: Record<string, { port: string; lat: number; lon: number }> = {
  'RS00': { port: 'Porto de Rio Grande', lat: -29.98, lon: -51.18 },
  'SP01': { port: 'Porto de Santos', lat: -23.96, lon: -46.31 },
  'PR00': { port: 'Porto de Paranaguá', lat: -25.50, lon: -48.51 },
  'SC00': { port: 'Porto de Itajaí', lat: -26.90, lon: -48.66 },
  'ES00': { port: 'Porto de Vitória', lat: -20.32, lon: -40.35 },
  'PE00': { port: 'Porto de Suape', lat: -8.39, lon: -34.96 },
  'RJ00': { port: 'Porto de Rio de Janeiro', lat: -22.90, lon: -43.17 },
  'BA00': { port: 'Porto de Salvador', lat: -12.97, lon: -38.51 },
  'CE00': { port: 'Porto de Fortaleza', lat: -3.73, lon: -38.53 },
  'PA00': { port: 'Porto de Belém', lat: -1.44, lon: -48.49 },
};

const DEST_PORTS: Record<string, string> = {
  US: 'Port of Los Angeles',
  CN: 'Port of Shanghai',
  DE: 'Port of Hamburg',
  GB: 'Port of London Gateway',
  JP: 'Port of Yokohama',
  KR: 'Port of Busan',
  AR: 'Port of Buenos Aires',
  MX: 'Port of Manzanillo',
  NL: 'Port of Rotterdam',
  IT: 'Port of Genoa',
  FR: 'Port of Marseille',
  ES: 'Port of Valencia',
  BE: 'Port of Antwerp-Bruges',
  CA: 'Port of Vancouver',
  AU: 'Port of Melbourne',
  SG: 'Port of Singapore',
  AE: 'Jebel Ali Port (Dubai)',
  IN: 'Port of Mumbai',
  PT: 'Port of Lisbon',
  RU: 'Port of St. Petersburg',
  ZA: 'Port of Cape Town',
  CL: 'Port of Valparaíso',
  TW: 'Port of Kaohsiung',
  HK: 'Port of Hong Kong',
  SA: 'Jeddah Islamic Port',
  EG: 'Port Said',
  NG: 'Lagos Port Complex',
  KE: 'Port of Mombasa',
  VN: 'Port of Haiphong',
  ID: 'Tanjung Priok (Jakarta)',
  TH: 'Port of Bangkok',
  TR: 'Port of Istanbul',
  MY: 'Port of Port Klang',
  PH: 'Port of Manila',
  IL: 'Port of Haifa',
  NZ: 'Port of Auckland',
  SE: 'Port of Gothenburg',
  NO: 'Port of Oslo',
  DK: 'Port of Aarhus',
  FI: 'Port of Helsinki',
  PL: 'Port of Gdansk',
  IE: 'Port of Dublin',
  GR: 'Port of Piraeus',
};

async function trySearates(imo: string): Promise<VesselTracking | null> {
  if (!SEARATES_KEY) return null;
  try {
    const url = proxyUrl("searates", `tracking?api_key=${SEARATES_KEY}&imo=${imo}`);
    const data = await getCached(url, 1800000);
    if (!data?.vessel) return null;
    return {
      vesselName: data.vessel.name || 'Unknown',
      imo: data.vessel.imo || imo,
      status: data.vessel.status || 'In Transit',
      origin: data.vessel.origin || 'Brazil',
      destination: data.vessel.destination || 'Unknown',
      eta: data.vessel.eta || 'N/A',
      trackingUrl: `https://www.vesselfinder.com/?imo=${imo}`,
      latitude: data.vessel.latitude,
      longitude: data.vessel.longitude,
    };
  } catch {
    return null;
  }
}

export async function getVesselTracking(urf: string, paisDestino: string): Promise<VesselTracking | null> {
  if (!SEARATES_KEY) return null;
  const originPort = URF_PORTS[urf]?.port;
  const destPort = DEST_PORTS[paisDestino];
  // Precisamos de um IMO real para consultar — sem API key ou sem IMO, não há dados
  // TODO: integrar com fonte real de IMO quando disponível
  return null;
}

export async function getVesselsByURF(urf: string, limit = 5): Promise<VesselTracking[]> {
  // Sem API key ou fonte real de dados, retorna vazio
  return [];
}