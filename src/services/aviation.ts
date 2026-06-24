/**
 * OpenSky Network Aviation Service
 * Rastreamento de aeronaves de carga em tempo real
 */

export interface AircraftState {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
}

export async function fetchCargoFlightsInBrazil(): Promise<AircraftState[]> {
  try {
    const res = await fetch(
      'https://opensky-network.org/api/states/all?lamin=-33&lamax=5&lomin=-74&lomax=-35',
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const states = data.states || [];
    return states.map((s: any[]) => ({
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      origin_country: s[2] || '',
      longitude: s[5],
      latitude: s[6],
      baro_altitude: s[7],
      velocity: s[9],
      heading: s[10],
      on_ground: s[8],
    })).filter((a: AircraftState) => a.latitude && a.longitude && !a.on_ground);
  } catch {
    return [];
  }
}

export async function fetchFlightsNearPort(lat: number, lon: number, radiusKm: number = 500): Promise<AircraftState[]> {
  const allFlights = await fetchCargoFlightsInBrazil();
  return allFlights.filter(f => {
    const dist = Math.sqrt(
      Math.pow((f.latitude - lat) * 111, 2) +
      Math.pow((f.longitude - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)
    );
    return dist <= radiusKm;
  });
}
