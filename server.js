// NOVO server.js — suporta CSV com ; (MDIC) e com fallback para API Comexstat online
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { STATIC_CAMERAS, fetchTfLCameras, fetchWSDOTCameras, fetchCaltransCameras, fetchCanadaCameras, fetchFloridaCameras, fetchEuropeCameras, fetchSingaporeCameras } from './cctv-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.argv.includes('--port') ? parseInt(process.argv[process.argv.indexOf('--port') + 1]) : 3001;

app.use(cors({
  origin: ['https://www.tradexa.com.br', 'https://tradexa.com.br'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

const VIA_MAP = {
  "00":"Via não declarada","01":"Marítima","02":"Fluvial","03":"Lacustre",
  "04":"Aérea","05":"Postal","06":"Ferroviária","07":"Rodoviária",
  "08":"Conduto/Rede","09":"Meios próprios","10":"Entrada/Saída ficta",
  "11":"Courier","12":"Em mãos","13":"Por reboque","14":"Dutos",
  "15":"Vicinal fronteiriço","99":"Via desconhecida"
};

const PAIS_MAP = {
  "063":"África do Sul","105":"Alemanha","160":"Argentina","169":"Austrália",
  "179":"Áustria","196":"Bélgica","226":"Canadá","239":"Chile","243":"China",
  "249":"Colômbia","267":"Coreia do Sul","280":"Dinamarca","285":"EUA",
  "291":"Espanha","300":"Estados Unidos","305":"Finlândia","309":"França",
  "358":"Hong Kong","386":"Índia","399":"Israel","400":"Itália","411":"Japão",
  "452":"México","474":"Noruega","493":"Panamá","507":"Peru","531":"Portugal",
  "538":"Reino Unido","548":"Rep. Dominicana","566":"Rússia","575":"Suécia",
  "578":"Suíça","586":"Taiwan","589":"Países Baixos","699":"Uruguai",
  "845":"Venezuela","097":"Não declarado"
};

const MES_MAP = {
  "01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun",
  "07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez"
};

const UF_MAP = {
  "AC":"Acre","AL":"Alagoas","AM":"Amazonas","AP":"Amapá","BA":"Bahia",
  "CE":"Ceará","DF":"Distrito Federal","ES":"Espírito Santo","GO":"Goiás",
  "MA":"Maranhão","MG":"Minas Gerais","MS":"Mato Grosso do Sul","MT":"Mato Grosso",
  "PA":"Pará","PB":"Paraíba","PE":"Pernambuco","PI":"Piauí","PR":"Paraná",
  "RJ":"Rio de Janeiro","RN":"Rio Grande do Norte","RO":"Rondônia","RR":"Roraima",
  "RS":"Rio Grande do Sul","SC":"Santa Catarina","SE":"Sergipe","SP":"São Paulo","TO":"Tocantins"
};

let municipiosCache = null;
const MAX_REGISTROS = 500;
const COMEXSTAT_API = 'https://api-comexstat.mdic.gov.br';

function parseCSVLine(line, useSemicolon = false) {
  const sep = useSemicolon ? ';' : ',';
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

async function loadMunicipios() {
  if (municipiosCache) return municipiosCache;
  
  const munPath = path.join(__dirname, 'data', 'EXP_2026_MUN.csv');
  if (!fs.existsSync(munPath)) {
    municipiosCache = {};
    return municipiosCache;
  }

  const index = {};
  const fileStream = fs.createReadStream(munPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let isFirstLine = true;
  let useSemicolon = false;
  
  for await (const line of rl) {
    if (isFirstLine) { 
      isFirstLine = false; 
      // Detect delimiter
      useSemicolon = line.includes(';');
      continue; 
    }
    if (!line.trim()) continue;
    
    const cols = parseCSVLine(line, useSemicolon);
    if (cols.length >= 11) {
      const key = `${cols[0]}_${cols[1]}_${cols[2]}_${cols[3]}_${cols[4]}_${cols[5]}_${cols[6]}`;
      if (!index[key]) index[key] = [];
      const kg = String(cols[8]).replace(/\./g, '').replace(',', '.');
      const fob = String(cols[9]).replace(/\./g, '').replace(',', '.');
      index[key].push({
        co_mun: cols[10],
        kg_liquido: parseFloat(kg) || 0,
        vl_fob: parseFloat(fob) || 0,
      });
    }
  }
  
  municipiosCache = index;
  console.log(`[server] Municípios carregados: ${Object.keys(index).length} chaves`);
  return index;
}

async function fetchFromComexstatAPI({tipo, ano, ncm, uf, pais, via}) {
  const body = {
    flow: tipo.toLowerCase(),
    monthDetail: false,
    period: { from: `${ano}-01`, to: `${ano}-12` },
    filters: ncm ? [{ filter: 'ncm', values: [ncm.replace(/\D/g, '')] }] : [],
    details: ['country', 'state', 'transport'],
    metrics: ['metricFOB', 'metricKG'],
  };
  
  if (uf) body.filters.push({ filter: 'state', values: [uf] });
  if (pais) body.filters.push({ filter: 'country', values: [pais] });
  if (via) body.filters.push({ filter: 'transport', values: [via] });

  const res = await fetch(`${COMEXSTAT_API}/general`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) throw new Error(`Comexstat ${res.status}`);
  const data = await res.json();
  const list = data?.data?.list || [];
  
  return list.map(item => ({
    co_ano: String(item.year || ano),
    co_mes: '01',
    mes_nome: 'Jan',
    co_pais: String(item.countryCode || item.country || '97'),
    pais_nome: item.country || PAIS_MAP[String(item.countryCode)] || `País ${item.countryCode}`,
    sg_uf: item.stateCode || item.state || '',
    uf_nome: UF_MAP[item.stateCode] || item.state || '',
    co_via: String(item.transportCode || item.transport || '0'),
    via_nome: VIA_MAP[String(item.transportCode)] || item.transport || 'Não informado',
    co_urf: '',
    urf_nome: '',
    co_unid: '10',
    unid_nome: '10',
    qt_estat: Number(item.metricStat) || 0,
    kg_liquido: Number(item.metricKG) || 0,
    vl_fob: Number(item.metricFOB) || 0,
    municipios: [],
  }));
}

// Endpoint: buscar por NCM (streaming CSV + fallback API)
app.get('/api/export-data', async (req, res) => {
  const { ncm, mes, uf, pais, via, tipo = 'EXP' } = req.query;
  
  if (!ncm) return res.status(400).json({ error: 'Parâmetro "ncm" obrigatório' });

  const ncmKey = String(ncm).replace(/\D/g, '');
  const csvPath = path.join(__dirname, 'data', `${tipo}_${req.query.ano || '2026'}.csv`);
  
  try {
    let registros = [];
    
    // Tentar CSV local primeiro
    if (fs.existsSync(csvPath)) {
      const municipios = await loadMunicipios();
      let totalEncontrados = 0;
      
      const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
      
      let isFirstLine = true;
      let useSemicolon = false;
      
      for await (const line of rl) {
        if (isFirstLine) { 
          isFirstLine = false; 
          useSemicolon = line.includes(';');
          continue; 
        }
        if (!line.trim()) continue;
        if (registros.length >= MAX_REGISTROS) break;
        
        const cols = parseCSVLine(line, useSemicolon);
        if (cols.length < 10) continue;
        
        const coNcm = (useSemicolon ? cols[2] : cols[2]).replace(/\D/g, '');
        if (coNcm !== ncmKey) continue;
        
        totalEncontrados++;
        
        const coMes = cols[1] || '';
        const sgUf = cols[5] || '';
        const coPais = cols[4] || '';
        const coVia = cols[6] || '';
        
        if (mes && coMes !== mes) continue;
        if (uf && sgUf !== String(uf).toUpperCase()) continue;
        if (pais && coPais !== pais) continue;
        if (via && coVia !== via) continue;
        
        const kg = String(cols[8]).replace(/\./g, '').replace(',', '.');
        const fob = String(cols[9]).replace(/\./g, '').replace(',', '.');
        
        const chave = `${cols[0]}_${cols[1]}_${cols[2]}_${cols[3]}_${cols[4]}_${cols[5]}_${cols[6]}`;
        
        registros.push({
          co_ano: cols[0] || '',
          co_mes: coMes,
          mes_nome: MES_MAP[coMes] || coMes,
          co_pais: coPais,
          pais_nome: PAIS_MAP[coPais] || coPais,
          sg_uf: sgUf,
          uf_nome: UF_MAP[sgUf] || sgUf,
          co_via: coVia,
          via_nome: VIA_MAP[coVia] || coVia,
          co_urf: cols[6] || '',
          urf_nome: cols[6] || '',
          co_unid: cols[3] || '',
          unid_nome: cols[3] || '',
          qt_estat: parseFloat(cols[7]) || 0,
          kg_liquido: parseFloat(kg) || 0,
          vl_fob: parseFloat(fob) || 0,
          municipios: (municipios[chave] || []).map(m => ({
            co_mun: m.co_mun,
            mun_nome: m.co_mun,
            kg_liquido: m.kg_liquido,
            vl_fob: m.vl_fob,
          })),
        });
      }
      
      if (registros.length === 0) {
        console.log(`[server] CSV buscou mas não achou ${ncmKey}, tentando API...`);
      } else {
        console.log(`[server] CSV: ${registros.length} registros encontrados`);
      }
    }
    
    // Se não achou nada no CSV, tentar API
    if (registros.length === 0) {
      console.log(`[server] Chamando Comexstat API para ${ncmKey}...`);
      const apiData = await fetchFromComexstatAPI({
        tipo, ano: req.query.ano || '2026', ncm, uf, pais, via
      });
      registros = apiData;
    }
    
    res.json({
      registros,
      total: registros.length,
      total_disponivel: registros.length,
      limite_atingido: registros.length >= MAX_REGISTROS,
      fonte: registros.length > 0 ? (fs.existsSync(csvPath) ? 'csv-local' : 'comexstat-api') : 'nenhum',
    });
    
  } catch (err) {
    console.error('[server] Erro:', err.message);
    res.status(500).json({ error: err.message, registros: [], total: 0 });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// NCM list from CSV
app.get('/api/ncm-list', async (req, res) => {
  const csvPath = path.join(__dirname, 'data', 'EXP_2026.csv');
  if (!fs.existsSync(csvPath)) return res.json([]);
  
  const ncms = new Map();
  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let isFirstLine = true;
  for await (const line of rl) {
    if (isFirstLine) { isFirstLine = false; continue; }
    if (!line.trim()) continue;
    const cols = parseCSVLine(line, line.includes(';'));
    if (cols.length >= 3) {
      const ncmRaw = cols[2]?.replace(/\D/g, '');
      if (ncmRaw) ncms.set(ncmRaw, (ncms.get(ncmRaw) || 0) + 1);
    }
  }
  
  res.json(Array.from(ncms.entries()).map(([code, count]) => ({ code, count })));
});

let munNames = {};
let sh4Desc = {};
try {
  const munNamesPath = path.join(__dirname, 'data', 'dicts', 'mun_names.json');
  if (fs.existsSync(munNamesPath)) {
    munNames = JSON.parse(fs.readFileSync(munNamesPath, 'utf-8'));
    console.log(`[server] Nomes de municípios carregados: ${Object.keys(munNames).length}`);
  }
  const sh4Path = path.join(__dirname, 'data', 'dicts', 'sh4_descriptions.json');
  if (fs.existsSync(sh4Path)) {
    sh4Desc = JSON.parse(fs.readFileSync(sh4Path, 'utf-8'));
    console.log(`[server] Descrições SH4 carregadas: ${Object.keys(sh4Desc).length}`);
  }
} catch (e) { console.error('[server] Erro carregando dicionários:', e.message); }

// ===== Inteligência Municipal — Ranking de Cidades Exportadoras =====
// Cache carregado sob demanda, depois manti
let municipalCache = null;
const MUNICIPAL_CSV = path.join(__dirname, 'data', 'EXP_2026_MUN.csv');

async function loadMunicipalData() {
  if (municipalCache) return municipalCache;
  const index = { by_mun: {}, by_mun_sh4: {}, by_uf: {}, top_muns: [], last_processed: null };
  if (!fs.existsSync(MUNICIPAL_CSV)) {
    municipalCache = index;
    return index;
  }
  const fileStream = fs.createReadStream(MUNICIPAL_CSV, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let isFirst = true;
  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; }
    if (!line.trim()) continue;
    const cols = parseCSVLine(line, line.includes(';'));
    if (cols.length < 8) continue;
    const co_mun = cols[5];
    const co_uf = cols[4];
    const sh4 = cols[2];
    const kg = parseFloat(String(cols[6]).replace(/\./g, '').replace(',', '.')) || 0;
    const fob = parseFloat(String(cols[7]).replace(/\./g, '').replace(',', '.')) || 0;
    if (!index.by_mun[co_mun]) index.by_mun[co_mun] = { co_mun, uf: co_uf, kg: 0, fob: 0, envios: 0, products: {} };
    index.by_mun[co_mun].kg += kg;
    index.by_mun[co_mun].fob += fob;
    index.by_mun[co_mun].envios += 1;
    // Agrega por produto SH4
    if (!index.by_mun[co_mun].products[sh4]) index.by_mun[co_mun].products[sh4] = { sh4, kg: 0, fob: 0, envios: 0 };
    index.by_mun[co_mun].products[sh4].kg += kg;
    index.by_mun[co_mun].products[sh4].fob += fob;
    index.by_mun[co_mun].products[sh4].envios += 1;
    // Agrega por UF
    if (!index.by_uf[co_uf]) index.by_uf[co_uf] = { uf: co_uf, kg: 0, fob: 0, envios: 0, muns: new Set() };
    index.by_uf[co_uf].kg += kg;
    index.by_uf[co_uf].fob += fob;
    index.by_uf[co_uf].envios += 1;
    index.by_uf[co_uf].muns.add(co_mun);
  }
  // Top muns
  index.top_muns = Object.values(index.by_mun)
    .sort((a, b) => b.fob - a.fob)
    .map(m => ({ ...m, top_products: Object.values(m.products).sort((a, b) => b.fob - a.fob).slice(0, 5) }));
  // UF
  index.by_uf = Object.fromEntries(Object.entries(index.by_uf).map(([k, v]) => [k, { ...v, mun_count: v.muns.size, muns: undefined }]));
  municipalCache = index;
  console.log(`[server] Dados municipais carregados: ${index.top_muns.length} cidades`);
  return index;
}

app.get('/api/municipal-ranking', async (req, res) => {
  try {
    const { uf, limit = 50 } = req.query;
    const data = await loadMunicipalData();
    let muns = data.top_muns;
    if (uf) muns = muns.filter(m => m.uf === String(uf).toUpperCase());
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    res.json({
      total: muns.length,
      uf_filter: uf || null,
      cidades: muns.slice(0, limitNum).map(m => ({
        co_mun: m.co_mun,
        mun_nome: munNames[m.co_mun] || `Cód. ${m.co_mun}`,
        uf: m.uf,
        kg_total: Math.round(m.kg),
        fob_total: Math.round(m.fob),
        envios: m.envios,
        top_products: m.top_products.slice(0, 5).map(p => ({
          ...p,
          descricao: sh4Desc[p.sh4] || `Posição ${p.sh4}`,
        })),
      }))
    });
  } catch (err) {
    console.error('[server] Erro municipal ranking:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/municipal', async (req, res) => {
  try {
    const { co_mun } = req.query;
    if (!co_mun) return res.status(400).json({ error: 'co_mun obrigatório' });
    const data = await loadMunicipalData();
    const mun = data.by_mun[String(co_mun)];
    if (!mun) return res.status(404).json({ error: 'Município não encontrado' });
    const products = Object.values(mun.products).sort((a, b) => b.fob - a.fob);
    res.json({
      co_mun: mun.co_mun,
      mun_nome: munNames[mun.co_mun] || `Cód. ${mun.co_mun}`,
      uf: mun.uf,
      kg_total: Math.round(mun.kg),
      fob_total: Math.round(mun.fob),
      envios: mun.envios,
      products: products.slice(0, 20).map(p => ({ ...p, descricao: sh4Desc[p.sh4] || `Posição ${p.sh4}` })),
      total_products: products.length,
      uf_rank: data.top_muns.findIndex(m => m.co_mun === String(co_mun)) + 1,
      brasil_rank: data.top_muns.findIndex(m => m.co_mun === String(co_mun)) + 1,
    });
  } catch (err) {
    console.error('[server] Erro municipal detalhe:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
// GLOBAL MONITORING API — Real-time data proxies
// ═══════════════════════════════════════════════

// ── CCTV Cameras (aggregate from all public sources) ──
let cctvCache = null;
let cctvCacheTime = 0;
const CCTV_CACHE_TTL = 5 * 60 * 1000; // 5 min

app.get('/api/cctv', async (req, res) => {
  try {
    const now = Date.now();
    if (cctvCache && (now - cctvCacheTime) < CCTV_CACHE_TTL) {
      return res.json(cctvCache);
    }

    const results = await Promise.allSettled([
      fetchTfLCameras(),
      fetchWSDOTCameras(),
      fetchCaltransCameras(),
      fetchCanadaCameras(),
      fetchFloridaCameras(),
      fetchEuropeCameras(),
      fetchSingaporeCameras(),
    ]);

    let cameras = [...STATIC_CAMERAS];
    for (const r of results) {
      if (r.status === 'fulfilled') cameras.push(...r.value);
    }

    // Deduplicate by id
    const seen = new Set();
    cameras = cameras.filter(c => {
      if (!c.lat || !c.lng) return false;
      const key = c.id || `${c.lat},${c.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const sources = {};
    for (const c of cameras) {
      sources[c.source] = (sources[c.source] || 0) + 1;
    }

    cctvCache = { cameras, total: cameras.length, sources, timestamp: new Date().toISOString() };
    cctvCacheTime = now;

    res.json(cctvCache);
  } catch (err) {
    res.status(500).json({ error: err.message, cameras: [] });
  }
});

// ── Earthquakes (USGS, M2.5+, last 24h) ──
let eqCache = null;
let eqCacheTime = 0;
app.get('/api/earthquakes', async (req, res) => {
  try {
    const now = Date.now();
    if (eqCache && (now - eqCacheTime) < 60000) return res.json(eqCache);

    const resp = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) throw new Error(`USGS ${resp.status}`);
    const data = await resp.json();

    const quakes = (data.features || []).map(f => ({
      id: f.id,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
      tsunami: f.properties.tsunami,
      alert: f.properties.alert,
    }));

    eqCache = { earthquakes: quakes, total: quakes.length, timestamp: new Date().toISOString() };
    eqCacheTime = now;
    res.json(eqCache);
  } catch (err) {
    res.status(500).json({ earthquakes: [], error: err.message });
  }
});

// ── Weather Events (NASA EONET — storms, volcanoes, icebergs) ──
let weatherCache = null;
let weatherCacheTime = 0;
app.get('/api/weather-events', async (req, res) => {
  try {
    const now = Date.now();
    if (weatherCache && (now - weatherCacheTime) < 300000) return res.json(weatherCache);

    const resp = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100', { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) throw new Error(`EONET ${resp.status}`);
    const data = await resp.json();

    const events = [];
    for (const event of (data.events || [])) {
      const geom = event.geometry?.[event.geometry.length - 1];
      if (!geom || geom.type !== 'Point') continue;
      const cat = event.categories?.[0]?.id || 'unknown';
      if (cat === 'wildfires' || cat === 'earthquakes') continue; // handled separately

      let typeLabel = 'Event', icon = 'alert', severity = 'low';
      if (cat === 'severeStorms') { typeLabel = 'Severe Storm'; icon = 'cyclone'; severity = 'high'; }
      else if (cat === 'volcanoes') { typeLabel = 'Volcano'; icon = 'volcano'; severity = 'high'; }
      else if (cat === 'seaIce') { typeLabel = 'Iceberg'; icon = 'ice'; severity = 'medium'; }

      events.push({
        id: event.id, title: event.title, category: cat,
        type: typeLabel, icon, severity,
        lat: geom.coordinates[1], lng: geom.coordinates[0],
        date: geom.date, source: event.sources?.[0]?.url || 'NASA EONET',
      });
    }

    weatherCache = { events, total: events.length, timestamp: new Date().toISOString() };
    weatherCacheTime = now;
    res.json(weatherCache);
  } catch (err) {
    res.status(500).json({ events: [], error: err.message });
  }
});

// ── Active Fires (NASA FIRMS, last 24h) ──
let firesCache = null;
let firesCacheTime = 0;
app.get('/api/fires', async (req, res) => {
  try {
    const now = Date.now();
    if (firesCache && (now - firesCacheTime) < 600000) return res.json(firesCache);

    const resp = await fetch('https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv', {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'TRADEXA-Platform/1.0' },
    });
    if (!resp.ok) throw new Error(`FIRMS ${resp.status}`);
    const csv = await resp.text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return res.json({ fires: [], total: 0 });

    const header = lines[0].split(',');
    const latIdx = header.indexOf('latitude');
    const lngIdx = header.indexOf('longitude');
    const brightIdx = header.indexOf('bright_ti4') !== -1 ? header.indexOf('bright_ti4') : header.indexOf('brightness');
    const confIdx = header.indexOf('confidence');
    const dateIdx = header.indexOf('acq_date');

    const fires = [];
    const maxPoints = 2000;
    const step = lines.length > maxPoints ? Math.ceil(lines.length / maxPoints) : 1;

    for (let i = 1; i < lines.length; i += step) {
      const cols = lines[i].split(',');
      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);
      if (isNaN(lat) || isNaN(lng)) continue;
      fires.push({
        lat: Math.round(lat * 1000) / 1000,
        lng: Math.round(lng * 1000) / 1000,
        brightness: parseFloat(cols[brightIdx]) || 0,
        confidence: cols[confIdx] || 'unknown',
        date: cols[dateIdx] || '',
      });
    }

    firesCache = { fires, total: fires.length, timestamp: new Date().toISOString() };
    firesCacheTime = now;
    res.json(firesCache);
  } catch (err) {
    res.status(500).json({ fires: [], error: err.message });
  }
});

// ── Port Weather (Open-Meteo — marine conditions at major ports) ──
const MONITORED_PORTS = [
  { name: 'Shanghai', lat: 31.23, lng: 121.47 },
  { name: 'Singapore', lat: 1.26, lng: 103.84 },
  { name: 'Rotterdam', lat: 51.90, lng: 4.50 },
  { name: 'Santos', lat: -23.95, lng: -46.32 },
  { name: 'Los Angeles', lat: 33.74, lng: -118.27 },
  { name: 'Suez Canal', lat: 29.93, lng: 32.56 },
  { name: 'Busan', lat: 35.10, lng: 129.04 },
  { name: 'Antwerp', lat: 51.30, lng: 4.40 },
  { name: 'Hamburg', lat: 53.55, lng: 9.97 },
  { name: 'Dubai', lat: 25.01, lng: 55.06 },
  { name: 'Houston', lat: 29.73, lng: -95.27 },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68 },
  { name: 'Tanjung Pelepas', lat: 1.36, lng: 103.55 },
  { name: 'Colombo', lat: 6.94, lng: 79.84 },
];

let portWeatherCache = null;
let portWeatherCacheTime = 0;
app.get('/api/port-weather', async (req, res) => {
  try {
    const now = Date.now();
    if (portWeatherCache && (now - portWeatherCacheTime) < 900000) return res.json(portWeatherCache); // 15 min

    const results = await Promise.allSettled(
      MONITORED_PORTS.map(async port => {
        const [marineRes, forecastRes] = await Promise.allSettled([
          fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${port.lat}&longitude=${port.lng}&current=wave_height,wave_direction,wave_period,sea_surface_temperature`, { signal: AbortSignal.timeout(8000) }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,visibility`, { signal: AbortSignal.timeout(8000) }),
        ]);

        const marine = marineRes.status === 'fulfilled' && marineRes.value.ok ? await marineRes.value.json() : null;
        const forecast = forecastRes.status === 'fulfilled' && forecastRes.value.ok ? await forecastRes.value.json() : null;

        return {
          name: port.name,
          lat: port.lat,
          lng: port.lng,
          marine: marine?.current || null,
          weather: forecast?.current || null,
        };
      })
    );

    const ports = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean);
    portWeatherCache = { ports, total: ports.length, timestamp: new Date().toISOString() };
    portWeatherCacheTime = now;
    res.json(portWeatherCache);
  } catch (err) {
    res.status(500).json({ ports: [], error: err.message });
  }
});

// ── Conflict Zones (static) ──
app.get('/api/conflicts', (req, res) => {
  res.json({
    zones: [
      { label: 'Ukraine War', severity: 'war', lat: 48.5, lng: 31.2 },
      { label: 'Gaza Conflict', severity: 'war', lat: 31.35, lng: 34.35 },
      { label: 'Sudan Civil War', severity: 'war', lat: 15.0, lng: 30.0 },
      { label: 'Myanmar Conflict', severity: 'war', lat: 19.5, lng: 96.5 },
      { label: 'DRC Conflict', severity: 'war', lat: -1.0, lng: 28.5 },
      { label: 'Yemen War', severity: 'war', lat: 15.5, lng: 48.0 },
      { label: 'Syria', severity: 'high', lat: 35.0, lng: 38.5 },
      { label: 'Taiwan Strait', severity: 'elevated', lat: 24.0, lng: 119.5 },
      { label: 'Korean DMZ', severity: 'elevated', lat: 38.3, lng: 127.0 },
      { label: 'Red Sea Threat', severity: 'high', lat: 16.0, lng: 40.0 },
      { label: 'Lebanon Border', severity: 'high', lat: 33.4, lng: 35.8 },
      { label: 'Sahel', severity: 'high', lat: 14.0, lng: 5.0 },
    ],
  });
});

// ── UN Comtrade — Global Trade Data (free preview, no key) ──
let comtradeCache = null;
let comtradeCacheTime = 0;
app.get('/api/comtrade', async (req, res) => {
  try {
    const now = Date.now();
    if (comtradeCache && (now - comtradeCacheTime) < 3600000) return res.json(comtradeCache); // 1h

    const reporterCode = req.query.reporter || '842'; // default: US
    const cmdCode = req.query.cmd || '2709'; // default: crude oil
    const flowCode = req.query.flow || 'M'; // M=imports, X=exports
    const period = req.query.period || String(new Date().getFullYear() - 1); // default: last year (Comtrade has ~1yr lag)

    const params = new URLSearchParams({ reporterCode, period, cmdCode, flowCode });
    const resp = await fetch(`https://comtradeapi.un.org/public/v1/preview/C/A/HS?${params}`, {
      signal: AbortSignal.timeout(20000),
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) throw new Error(`Comtrade ${resp.status}`);
    const data = await resp.json();

    const result = {
      source: 'UN Comtrade',
      reporter: reporterCode,
      commodity: cmdCode,
      flow: flowCode === 'M' ? 'Imports' : 'Exports',
      period,
      records: (data?.data || []).slice(0, 20),
      total: data?.data?.length || 0,
      timestamp: new Date().toISOString(),
    };

    comtradeCache = result;
    comtradeCacheTime = now;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, records: [] });
  }
});

// ── GDELT GEO — Global Event Mapping (free, no key, GeoJSON) ──
let gdeltCache = null;
let gdeltCacheTime = 0;
app.get('/api/gdelt-geo', async (req, res) => {
  try {
    const now = Date.now();
    if (gdeltCache && (now - gdeltCacheTime) < 900000) return res.json(gdeltCache); // 15 min

    const query = req.query.q || 'conflict OR military OR protest OR crisis OR trade OR economy';
    const params = new URLSearchParams({
      query,
      mode: 'PointData',
      timespan: '24h',
      format: 'GeoJSON',
      maxpoints: '300',
    });

    const resp = await fetch(`https://api.gdeltproject.org/api/v2/geo/geo?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) throw new Error(`GDELT ${resp.status}`);
    const data = await resp.json();

    const features = (data?.features || []).map(f => ({
      lat: f.geometry?.coordinates?.[1],
      lng: f.geometry?.coordinates?.[0],
      name: (f.properties?.name || f.properties?.html || '').replace(/<[^>]*>/g, '').substring(0, 100),
      count: f.properties?.count || 1,
      type: f.properties?.type || 'event',
    })).filter(f => f.lat && f.lng);

    gdeltCache = { events: features, total: features.length, query, timestamp: new Date().toISOString() };
    gdeltCacheTime = now;
    res.json(gdeltCache);
  } catch (err) {
    res.status(500).json({ events: [], error: err.message });
  }
});

// ═══════════════════════════════════════
// PAGE TRACKING — Telegram notifications
// ═══════════════════════════════════════
const TELEGRAM_BOT_TOKEN = '8860844810:AAGUAFdT7iJpPvvBazbmEHw4OgM0o_Gyhd4';
const TELEGRAM_CHAT_ID = '8374881263';

const TRACKED_PAGES = [
  '/intelligence', '/trade-intelligence', '/dashboard',
  '/maritime-freight-map', '/supply-chain',
  '/global-tariff', '/ncm-comparison', '/ai-search',
  '/importadores', '/hts-lookup', '/us-trade',
  '/glossario', '/recursos', '/blog',
  '/landing/ncm-classifier', '/landing/tariff-calculator',
  '/landing/import-dashboard', '/landing/export-opportunities',
];

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
}

async function getGeoLocation(ip) {
  // Skip private IPs
  if (!ip || ip === 'unknown' || ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.') || ip === '127.0.0.1' || ip === '::1') {
    return { city: 'Desconhecida', region: '', country: 'Desconhecido', loc: '' };
  }
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,query,lat,lon,isp`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await resp.json();
    if (data.status === 'success') {
      return {
        city: data.city || 'Desconhecida',
        region: data.regionName || '',
        country: data.country || 'Desconhecido',
        isp: data.isp || '',
        loc: data.lat && data.lon ? `${data.lat},${data.lon}` : '',
      };
    }
  } catch {}
  return { city: 'Desconhecida', region: '', country: 'Desconhecido', loc: '' };
}

function getDeviceInfo(ua) {
  if (!ua) return { browser: 'Desconhecido', os: 'Desconhecido', device: 'Desktop' };
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
  const device = isMobile ? '📱 Mobile' : '💻 Desktop';
  let browser = 'Desconhecido';
  if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  let os = 'Desconhecido';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return { browser, os, device };
}

async function sendTelegramAlert(page, referrer, geo, device, ip, ua) {
  const emoji = page.startsWith('/landing/') ? '🏠' : page.startsWith('/blog/') ? '📝' : page.startsWith('/glossario') ? '📖' : page.startsWith('/intelligence') ? '📊' : page.startsWith('/maritime') ? '🚢' : '👤';
  const refText = referrer && !referrer.includes('tradexa.com.br') ? `\n🔗 Origem: ${referrer}` : '';
  const time = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const mapLink = geo.loc ? `\n📍 Mapa: https://www.google.com/maps?q=${geo.loc}` : '';
  const ispText = geo.isp ? `\n📡 ISP: ${geo.isp}` : '';
  
  const message = `${emoji} *Nova Visita!*\n\n📄 *Página:* ${page}\n🕐 *Horário:* ${time}\n🌍 *Local:* ${geo.city}${geo.region ? `, ${geo.region}` : ''} — ${geo.country}${mapLink}${ispText}\n💻 *Dispositivo:* ${device.device}\n🌐 *Navegador:* ${device.browser}\n⚙ *SO:* ${device.os}\n🆔 IP: \`${ip}\`${refText}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('[tracking] Telegram error:', err.message);
  }
}

app.post('/api/track-page', async (req, res) => {
  try {
    const { page, referrer } = req.body;
    if (!page) return res.json({ ok: false });

    const ip = getClientIP(req);
    const ua = req.headers['user-agent'] || '';
    const geo = await getGeoLocation(ip);
    const device = getDeviceInfo(ua);

    // Send to Telegram (fire-and-forget)
    sendTelegramAlert(page, referrer, geo, device, ip, ua);

    res.json({ ok: true });
  } catch (err) {
    console.error('[tracking] Error:', err.message);
    res.json({ ok: false });
  }
});

// SPA fallback — servir index.html para rotas não-API
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback deve vir DEPOIS da API, não antes
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (!fs.existsSync(distPath)) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(PORT, () => {
  console.log(`[server] API rodando em http://localhost:${PORT}`);
  console.log(`[server] CSV local + fallback Comexstat API`);
  console.log(`[server] SPA fallback ativo para dist/`);
});
