/**
 * Open-Meteo Port Weather Service
 * Condições meteorológicas em portos mundiais
 */

export interface PortWeather {
  portName: string;
  lat: number;
  lon: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherCode: number;
  weatherDesc: string;
  timestamp: string;
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Geada', 51: 'Chuva leve', 53: 'Chuva moderada', 55: 'Chuva forte',
  61: 'Chuva', 63: 'Chuva moderada', 65: 'Chuva forte',
  71: 'Neve', 73: 'Neve moderada', 75: 'Neve forte',
  80: 'Pancadas', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
  95: 'Trovoada', 96: 'Trovoada com granizo', 99: 'Trovoada com granizo forte',
};

// Principais portos brasileiros com coordenadas
export const BRAZILIAN_PORTS = [
  { name: 'Santos', lat: -23.96, lon: -46.33, state: 'SP' },
  { name: 'Pecém', lat: -3.53, lon: -38.79, state: 'CE' },
  { name: 'Paranaguá', lat: -25.52, lon: -48.50, state: 'PR' },
  { name: 'Rio Grande', lat: -32.03, lon: -52.10, state: 'RS' },
  { name: 'Itajaí', lat: -26.90, lon: -48.66, state: 'SC' },
  { name: 'Suape', lat: -8.39, lon: -34.95, state: 'PE' },
  { name: 'Vitória', lat: -20.29, lon: -40.34, state: 'ES' },
  { name: 'São Luís', lat: -2.53, lon: -44.28, state: 'MA' },
  { name: 'Aratu', lat: -12.77, lon: -38.51, state: 'BA' },
  { name: 'Navegantes', lat: -26.90, lon: -48.68, state: 'SC' },
];

export async function fetchPortWeather(port: { name: string; lat: number; lon: number }): Promise<PortWeather> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode,precipitation&timezone=auto`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const c = data.current;
    return {
      portName: port.name,
      lat: port.lat,
      lon: port.lon,
      temperature: c.temperature_2m,
      windSpeed: c.windspeed_10m,
      windDirection: c.winddirection_10m,
      precipitation: c.precipitation,
      weatherCode: c.weathercode,
      weatherDesc: WEATHER_CODES[c.weathercode] || 'Desconhecido',
      timestamp: c.time,
    };
  } catch {
    return {
      portName: port.name, lat: port.lat, lon: port.lon,
      temperature: 0, windSpeed: 0, windDirection: 0,
      precipitation: 0, weatherCode: -1, weatherDesc: 'Erro ao buscar dados',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchAllBrazilianPortsWeather(): Promise<PortWeather[]> {
  const results = await Promise.allSettled(
    BRAZILIAN_PORTS.map(port => fetchPortWeather(port))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<PortWeather> => r.status === 'fulfilled')
    .map(r => r.value);
}
