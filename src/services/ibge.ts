import { getCached } from './cache';
import { proxyUrl } from './apiProxy';

export const ibge = {
  // Todos os municípios
  getMunicipios: () => getCached(proxyUrl("ibge", "localidades/municipios"), 86400000),

  // Município específico
  getMunicipio: (codIBGE: string) => getCached(proxyUrl("ibge", `localidades/municipios/${codIBGE}`), 86400000),

  // Municípios de um estado
  getMunicipiosByUF: (uf: string) => getCached(proxyUrl("ibge", `localidades/estados/${uf}/municipios`), 86400000),

  // Estados
  getEstados: () => getCached(proxyUrl("ibge", "localidades/estados"), 86400000),

  // GeoJSON com centróides dos municípios
  getGeoJSON: () => getCached(proxyUrl("githubGeo", "tbrugz/geodata-br/master/geojson/geojs-100-mun.json"), 86400000),
};

// Cache local para lookup rápido de nome do município
let municipiosCache: Map<string, string> | null = null;

export async function getMunicipioNome(cityId: string): Promise<string> {
  if (!municipiosCache) {
    const data = await ibge.getMunicipios();
    municipiosCache = new Map();
    for (const m of data) {
      municipiosCache.set(String(m.id), m.nome);
    }
  }
  return municipiosCache.get(cityId) || cityId;
}

export async function getMunicipioCoords(cityId: string): Promise<[number, number] | null> {
  try {
    const geojson = await ibge.getGeoJSON();
    for (const feature of geojson.features || []) {
      if (String(feature.properties?.id) === cityId || String(feature.properties?.CD_GEOCODU) === cityId) {
        const coords = feature.geometry?.coordinates;
        if (coords) {
          // GeoJSON é [lng, lat], Leaflet usa [lat, lng]
          return [coords[1], coords[0]];
        }
      }
    }
  } catch {
    // fallback: centro do Brasil
  }
  return null;
}