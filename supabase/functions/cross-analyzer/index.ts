import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const COMEXSTAT_GENERAL = "https://api-comexstat.mdic.gov.br/general"
const COMEXSTAT_CITIES = "https://api-comexstat.mdic.gov.br/cities"

const COMMODITY_NAMES: Record<string, string> = {
  "1201": "Soybeans", "0901": "Coffee", "1701": "Cane/beet sugar",
  "2601": "Iron ore", "4403": "Wood", "0202": "Beef (frozen)",
  "0201": "Beef (fresh)", "2304": "Soybean meal", "1507": "Soybean oil",
  "0803": "Bananas", "0801": "Coconuts", "2401": "Tobacco",
  "2709": "Petroleum oils", "2710": "Petroleum products", "2804": "Hydrogen",
  "7108": "Gold", "7102": "Diamonds", "3102": "Mineral fertilizers",
  "8703": "Motor cars", "8704": "Motor vehicles", "8802": "Aircraft",
  "3004": "Medicaments", "2847": "Hydrogen peroxide", "3901": "Polymers",
  "8544": "Electrical conductors", "8471": "Computers", "9018": "Medical instruments",
  "7201": "Pig iron", "7210": "Flat-rolled iron", "8411": "Turbojets",
}

async function fetchWithRetry(url: string, body?: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = body
        ? await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
        : await fetch(url)
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, delay)); continue }
      }
      return res
    } catch (_e) { if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1))) }
  }
  return null
}

// ── Fetch COMEXSTAT export data for a given heading ──────
async function fetchComexData(sh4: string, year: string, flowType: string, detailBy?: string) {
  try {
    const resp = await fetchWithRetry(COMEXSTAT_GENERAL, {
      flowType,
      period: { from: `${year}-01`, to: `${year}-12` },
      filters: [{ filter: "heading", values: [sh4.slice(0, 4)] }],
      details: detailBy ? [detailBy] : ["country"],
      metrics: ["metricFOB", "metricKG"],
      monthDetail: true,
      page: 1, perPage: 500,
    }, 2)
    if (resp?.ok) {
      const d = await resp.json()
      return d?.data?.list || []
    }
  } catch (_e) { /* ignore */ }
  return []
}

// ── Compute seasonality from records ─────────────────────
function computeSeasonality(records: any[]) {
  const values = records.map(r => r.value).filter(v => v > 0)
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const peakMonths = records.filter(r => r.value > avg * 1.2).map(r => r.month_label || r.period)
  const half = Math.floor(values.length / 2)
  const first = values.slice(0, Math.max(1, half))
  const last = values.slice(-Math.max(1, half))
  const trend = first.length && last.length
    ? (last.reduce((a, b) => a + b, 0) / last.length > first.reduce((a, b) => a + b, 0) / first.length * 1.05 ? "up" : last.reduce((a, b) => a + b, 0) / last.length < first.reduce((a, b) => a + b, 0) / first.length * 0.95 ? "down" : "stable")
    : "stable"
  return { avg: Math.round(avg), peakMonths, trend }
}

// ── Real SEASONALITY from COMEXSTAT ──────────────────────
async function fetchSeasonality(sh4: string, year: string) {
  const records: any[] = []
  try {
    const list = await fetchComexData(sh4, year, "export", "country")
    if (list.length > 0) {
      const byMonth: Record<string, any> = {}
      for (const item of list) {
        const m = item.monthNumber || item.month || ""
        if (!m) continue
        if (!byMonth[m]) byMonth[m] = { value: 0, qty: 0 }
        byMonth[m].value += Number(item.metricFOB || 0)
        byMonth[m].qty += Number(item.metricKG || 0)
      }
      const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
      for (let i = 0; i < 12; i++) {
        const mIdx = String(i + 1).padStart(2, "0")
        const item = byMonth[mIdx]
        records.push({ period: `${year}-${mIdx}`, value: item?.value || 0, qty: item?.qty || 0, month_label: months[i] })
      }
    }
  } catch (_e) { /* ignore */ }
  return records
}

// ── Real MIRROR TRADE from COMEXSTAT (BR export vs BR import from partner) ──
async function fetchMirrorTrade(sh4: string, year: string) {
  const rows: any[] = []
  try {
    // Fetch BR exports and imports for this heading
    const [expList, impList] = await Promise.all([
      fetchComexData(sh4, year, "export", "country"),
      fetchComexData(sh4, year, "import", "country"),
    ])

    // Aggregate by country
    const byCountry: Record<string, { exp_fob: number; imp_cif: number }> = {}
    for (const item of expList) {
      const c = item.country || "Outros"
      if (!byCountry[c]) byCountry[c] = { exp_fob: 0, imp_cif: 0 }
      byCountry[c].exp_fob += Number(item.metricFOB || 0)
    }
    for (const item of impList) {
      const c = item.country || "Outros"
      if (!byCountry[c]) byCountry[c] = { exp_fob: 0, imp_cif: 0 }
      byCountry[c].imp_cif += Number(item.metricFOB || 0)
    }

    // Build mirror rows for top 10 partners
    const sorted = Object.entries(byCountry)
      .filter(([, v]) => v.exp_fob > 0 || v.imp_cif > 0)
      .sort((a, b) => (b[1].exp_fob + b[1].imp_cif) - (a[1].exp_fob + a[1].imp_cif))
      .slice(0, 10)

    const name = COMMODITY_NAMES[sh4] || `HS ${sh4}`
    for (const [country, v] of sorted) {
      const diff_pct = v.exp_fob > 0 ? Math.round(((v.imp_cif - v.exp_fob) / v.exp_fob) * 1000) / 10 : 0
      let status = "Consistente"
      if (diff_pct > 15) status = "Gap identificado"
      if (diff_pct < -10) status = "Inversão"
      rows.push({
        commodity: `${name} (${sh4})`,
        partner: country,
        br_export_fob: v.exp_fob,
        br_import_cif: v.imp_cif,
        diff_pct,
        status,
        year,
      })
    }
  } catch (_e) { /* ignore */ }
  return rows
}

// ── Real PRICE ARBITRAGE from COMEXSTAT (unit price EXP vs IMP) ──
async function fetchPriceArbitrage(sh4: string, year: string) {
  try {
    const [expList, impList] = await Promise.all([
      fetchComexData(sh4, year, "export", "country"),
      fetchComexData(sh4, year, "import", "country"),
    ])

    // Calculate average unit price (FOB/kg) for exports and imports
    let expFob = 0, expKg = 0, impFob = 0, impKg = 0
    for (const item of expList) {
      expFob += Number(item.metricFOB || 0)
      expKg += Number(item.metricKG || 0)
    }
    for (const item of impList) {
      impFob += Number(item.metricFOB || 0)
      impKg += Number(item.metricKG || 0)
    }

    const brPriceKg = expKg > 0 ? Math.round((expFob / expKg) * 1000) / 1000 : 0
    const impPriceKg = impKg > 0 ? Math.round((impFob / impKg) * 1000) / 1000 : 0
    const diff = Math.round((impPriceKg - brPriceKg) * 1000) / 1000
    const diff_pct = brPriceKg > 0 ? Math.round((diff / brPriceKg) * 1000) / 10 : 0
    const name = COMMODITY_NAMES[sh4] || `HS ${sh4}`

    if (brPriceKg > 0 || impPriceKg > 0) {
      return {
        ncm: sh4,
        hts: sh4,
        commodity_name: name,
        br_price_kg: brPriceKg,
        import_price_kg: impPriceKg,
        br_export_fob: expFob,
        br_import_cif: impFob,
        diff,
        diff_pct,
        opportunity_flag: diff_pct > 20,
        year,
      }
    }
  } catch (_e) { /* ignore */ }
  return null
}

// ── Real COMPETITOR INTEL from COMEXSTAT (top exporting states) ──
async function fetchCompetitorIntel(sh4: string, year: string) {
  const competitors: any[] = []
  try {
    // Fetch export data broken down by UF (Brazilian state = "competitor region")
    const resp = await fetchWithRetry(COMEXSTAT_GENERAL, {
      flowType: "export",
      period: { from: `${year}-01`, to: `${year}-12` },
      filters: [{ filter: "heading", values: [sh4.slice(0, 4)] }],
      details: ["uf"],
      metrics: ["metricFOB", "metricKG"],
      page: 1, perPage: 500,
    }, 2)

    if (resp?.ok) {
      const d = await resp.json()
      const list = d?.data?.list || []
      const byUf: Record<string, { fob: number; kg: number }> = {}
      let totalFob = 0
      for (const item of list) {
        const uf = item.uf || item.state || "?"
        const fob = Number(item.metricFOB || 0)
        const kg = Number(item.metricKG || 0)
        totalFob += fob
        if (!byUf[uf]) byUf[uf] = { fob: 0, kg: 0 }
        byUf[uf].fob += fob
        byUf[uf].kg += kg
      }

      const sorted = Object.entries(byUf)
        .filter(([, v]) => v.fob > 0)
        .sort((a, b) => b[1].fob - a[1].fob)
        .slice(0, 8)

      for (const [uf, v] of sorted) {
        const share = totalFob > 0 ? Math.round((v.fob / totalFob) * 1000) / 10 : 0
        competitors.push({
          name: `Estado ${uf}`,
          state: uf,
          country: "BR",
          export_fob: v.fob,
          export_kg: v.kg,
          market_share: share,
          unit_price_kg: v.kg > 0 ? Math.round((v.fob / v.kg) * 1000) / 1000 : 0,
        })
      }
    }
  } catch (_e) { /* ignore */ }
  return competitors
}

// ── Fallback: demo seasonality ──────────────────────────
function buildSeasonal(sh4: string, year: string) {
  const base = Math.max(10_000_000, parseInt(sh4, 10) * 100_000)
  const seasonFactors = [0.9, 0.85, 1.15, 1.3, 1.2, 1.0, 0.7, 0.75, 0.95, 1.1, 1.35, 1.25]
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
  return months.map((m, i) => {
    const v = Math.round(base * seasonFactors[i] * (0.9 + Math.random() * 0.2))
    return { period: `${year}-${String(i+1).padStart(2,"0")}`, value: v, qty: Math.round(v / (0.3 + Math.random())), month_label: m }
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  try {
    const body = await req.json()
    const action = body.action || 'seasonality'

    // ══ SEASONALITY ════════════════════════════════════════
    if (action === 'seasonality') {
      const ncm = String(body.ncm || '').replace(/\D/g, '')
      const sh4 = ncm.slice(0, 4).padEnd(4, '0')
      const year = body.year || '2025'
      let records = await fetchSeasonality(sh4, year)
      let source = 'comexstat-api'

      if (records.length === 0 || records.every(r => r.value === 0)) {
        records = buildSeasonal(sh4, year)
        source = 'demo-fallback'
      }

      const { avg, peakMonths, trend } = computeSeasonality(records)
      return new Response(JSON.stringify({
        ncm: sh4, year, monthly_data: records, peak_months: peakMonths,
        trend, average_monthly: avg, source
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    // ══ PRICE ARBITRAGE ═══════════════════════════════════
    if (action === 'price-arbitrage') {
      const ncm = String(body.ncm || '').replace(/\D/g, '')
      const sh4 = ncm.slice(0, 4).padEnd(4, '0')
      const year = body.year || '2025'
      const real = await fetchPriceArbitrage(sh4, year)
      if (real) {
        return new Response(JSON.stringify({
          ...real, source: 'comexstat-api'
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
      }
      // No real data — return empty with clear message
      return new Response(JSON.stringify({
        ncm: sh4, hts: sh4, commodity_name: COMMODITY_NAMES[sh4] || `HS ${sh4}`,
        br_price_kg: 0, import_price_kg: 0, diff: 0, diff_pct: 0,
        opportunity_flag: false, year,
        source: 'sem-dados',
        message: `Sem dados de preço para HS ${sh4} no ano ${year}. Verifique o código HS.`
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    // ══ MIRROR TRADE ══════════════════════════════════════
    if (action === 'mirror-trade') {
      const ncm = String(body.ncm || '').replace(/\D/g, '')
      const sh4 = ncm.slice(0, 4).padEnd(4, '0')
      const year = body.year || '2025'
      const rows = await fetchMirrorTrade(sh4, year)
      if (rows.length > 0) {
        return new Response(JSON.stringify({
          ncm: sh4, year, rows, total_rows: rows.length, source: 'comexstat-api'
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({
        ncm: sh4, year, rows: [], total_rows: 0, source: 'sem-dados',
        message: `Sem dados de mirror trade para HS ${sh4} no ano ${year}. Verifique o código HS.`
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    // ══ COMPETITOR INTEL ══════════════════════════════════
    if (action === 'competitor-intel') {
      const ncm = String(body.ncm || '').replace(/\D/g, '')
      const sh4 = ncm.slice(0, 4).padEnd(4, '0')
      const year = body.year || '2025'
      const competitors = await fetchCompetitorIntel(sh4, year)
      if (competitors.length > 0) {
        return new Response(JSON.stringify({
          ncm: sh4, year, competitors, total: competitors.length, source: 'comexstat-api'
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({
        ncm: sh4, year, competitors: [], total: 0, source: 'sem-dados',
        message: `Sem dados de competitividade para HS ${sh4} no ano ${year}. Verifique o código HS.`
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})