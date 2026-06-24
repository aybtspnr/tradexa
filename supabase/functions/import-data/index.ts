import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VIA_MAP = {
  "0":"Via não declarada","1":"Marítima","2":"Fluvial","3":"Lacustre",
  "4":"Aérea","5":"Postal","6":"Ferroviária","7":"Rodoviária",
  "8":"Conduto/Rede","9":"Meios próprios","10":"Entrada/Saída ficta",
  "11":"Courier","12":"Em mãos","13":"Por reboque","14":"Dutos",
  "15":"Vicinal fronteiriço","99":"Via desconhecida"
}

const UF_MAP = {
  "AC":"Acre","AL":"Alagoas","AM":"Amazonas","AP":"Amapá","BA":"Bahia",
  "CE":"Ceará","DF":"Distrito Federal","ES":"Espírito Santo","GO":"Goiás",
  "MA":"Maranhão","MG":"Minas Gerais","MS":"Mato Grosso do Sul","MT":"Mato Grosso",
  "PA":"Pará","PB":"Paraíba","PE":"Pernambuco","PI":"Piauí",
  "PR":"Paraná","RJ":"Rio de Janeiro","RN":"Rio Grande do Norte",
  "RO":"Rondônia","RR":"Roraima","RS":"Rio Grande do Sul",
  "SC":"Santa Catarina","SE":"Sergipe","SP":"São Paulo","TO":"Tocantins"
}

const MES_MAP = {
  "01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun",
  "07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez"
}

const PAIS_NUM_MAP = {
  "063":"África do Sul","105":"Alemanha","160":"Argentina","169":"Austrália",
  "179":"Áustria","196":"Bélgica","226":"Canadá","239":"Chile","243":"China",
  "249":"Colômbia","267":"Coreia do Sul","280":"Dinamarca","285":"Emirados Árabes",
  "291":"Espanha","300":"Estados Unidos","305":"Finlândia","309":"França",
  "358":"Hong Kong","386":"Índia","399":"Israel","400":"Itália","411":"Japão",
  "452":"México","474":"Noruega","493":"Panamá","507":"Peru","531":"Portugal",
  "538":"Reino Unido","548":"Rep. Dominicana","566":"Rússia","575":"Suécia",
  "578":"Suíça","586":"Taiwan","589":"Países Baixos","699":"Uruguai",
  "845":"Venezuela","097":"Não declarado"
}

const COMEXSTAT_API = "https://api-comexstat.mdic.gov.br"
const MAX_REGISTROS = 500

function paisName(code) {
  return PAIS_NUM_MAP[code] || `País ${code}`
}

function parseDateRange(body) {
  const anoDe = body.anoDe || ''
  const mesDe = body.mesDe || ''
  const anoAte = body.anoAte || ''
  const mesAte = body.mesAte || ''

  if (anoDe && mesDe && anoAte && mesAte) {
    return {
      from: `${anoDe}-${mesDe.padStart(2,'0')}`,
      to: `${anoAte}-${mesAte.padStart(2,'0')}`,
      fromYear: anoDe, fromMonth: mesDe,
      toYear: anoAte, toMonth: mesAte,
    }
  }

  const ano = body.ano || '2025'
  const mes = body.mes || ''
  if (mes) {
    const mm = mes.padStart(2,'0')
    return { from: `${ano}-${mm}`, to: `${ano}-${mm}`, fromYear: ano, fromMonth: mm, toYear: ano, toMonth: mm }
  }

  return { from: `${ano}-01`, to: `${ano}-12`, fromYear: ano, fromMonth: '01', toYear: ano, toMonth: '12' }
}

    // Build reverse maps for name-to-code lookups
const UF_NAME_TO_CODE = {}
for (const [code, name] of Object.entries(UF_MAP)) UF_NAME_TO_CODE[name.normalize('NFC')] = code

const PAIS_NAME_TO_CODE = {}
for (const [code, name] of Object.entries(PAIS_NUM_MAP)) PAIS_NAME_TO_CODE[name.normalize('NFC')] = code

async function fetchWithRetry(url, body, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[API-COMEXSTAT] 429 — retry ${attempt + 1}/${maxRetries} em ${delay}ms`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      return res;
    } catch (e) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  return null;
}

async function fetchFromComexstatApi(tipo, ncm, uf, pais, via, max, range) {
  console.log(`[API-COMEXSTAT] NCM=${ncm} tipo=${tipo} uf=${uf} pais=${pais} via=${via} period=${range.from}..${range.to}`)

  const registros = []
  const arquivosLidos = []
  const isSingleMonth = range.from === range.to

  try {
    const sh4 = ncm ? ncm.replace(/\D/g, '').substring(0, 4) : ''
    const apiFlow = tipo === 'EXP' ? 'export' : 'import'

    // COMEXSTAT API filters are flaky for state/country/via — fetch full data and filter client-side
    const needsClientSidePais = !!(pais && pais !== '_all')
    const needsClientSideUf   = !!(uf   && uf   !== '_all')
    const needsClientSideVia  = !!(via  && via  !== '_all')

    // PRIMARY: /general endpoint (always include country+state for full filtering)
    const generalBody = {
      flow: apiFlow,
      monthDetail: !isSingleMonth,
      period: { from: range.from, to: range.to },
      filters: [],
      details: ["country", "state"],
      metrics: ["metricFOB", "metricKG"],
    }

    if (sh4) generalBody.filters.push({ filter: "heading", values: [sh4] })

    console.log(`[API-COMEXSTAT] POST ${COMEXSTAT_API}/general:`, JSON.stringify(generalBody).substring(0, 300))

    const generalResponse = await fetchWithRetry(`${COMEXSTAT_API}/general`, generalBody)

    if (!generalResponse.ok) {
      console.error(`[API-COMEXSTAT] /general error: ${generalResponse.status}`)
    } else {
      const genData = await generalResponse.json()
      const genList = genData?.data?.list || []
      console.log(`[API-COMEXSTAT] /general returned ${genList.length} records`)

      for (const item of genList) {
        if (registros.length >= max) break
        let rawCountry = String(item.country || item.countryName || item.noPais || item.coPais || "97")
        rawCountry = rawCountry.normalize('NFC')
        const pais_nome = rawCountry.match(/[a-záéíóúãõç ]/i) ? rawCountry : paisName(rawCountry)
        let co_pais = String(item.countryCode || item.coPais || PAIS_NAME_TO_CODE[rawCountry] || rawCountry)

        let rawState = String(item.state || item.stateName || item.noUf || item.sgUf || "")
        rawState = rawState.normalize('NFC')
        const uf_nome = rawState.match(/[a-záéíóúãõç ]/i) ? rawState : UF_MAP[rawState] || rawState
        let sg_uf = String(item.stateCode || item.sgUf || UF_NAME_TO_CODE[rawState] || "")

        const co_via = item.transport || item.transportCode || item.coVia || "0"
        const rawMonth = item.monthNumber || item.month || item.coMes || "01"
        const co_mes = rawMonth.toString().padStart(2, '0')

        // client-side filter
        if (needsClientSidePais) {
          const paisQuery = pais.toLowerCase()
          const matchPais = co_pais.toLowerCase() === paisQuery ||
            pais_nome.toLowerCase().includes(paisQuery) ||
            paisQuery.includes(pais_nome.toLowerCase())
          if (!matchPais) continue
        }
        if (needsClientSideUf) {
          const ufQuery = uf.toUpperCase()
          const matchUf = sg_uf.toUpperCase() === ufQuery ||
            uf_nome.toLowerCase().includes(uf.toLowerCase()) ||
            UF_MAP[ufQuery] === uf_nome
          if (!matchUf) continue
        }
        if (needsClientSideVia) {
          if (String(co_via) !== via) continue
        }

        registros.push({
          co_ano: String(item.year || item.coAno || range.from.split('-')[0]),
          co_mes,
          mes_nome: MES_MAP[co_mes] || co_mes,
          co_pais: String(co_pais),
          pais_nome,
          sg_uf: String(sg_uf),
          uf_nome,
          co_via: String(co_via),
          via_nome: VIA_MAP[String(co_via)] || String(co_via),
          co_urf: item.customs || item.urf || item.coUrf || "",
          urf_nome: item.customs || item.urf || "",
          co_unid: item.unit || item.coUnid || "10",
          unid_nome: item.unit || "10",
          qt_estat: Number(item.metricStat) || Number(item.qtEstat) || 0,
          kg_liquido: Number(item.metricKG) || Number(item.kgLiquido) || 0,
          vl_fob: Number(item.metricFOB) || Number(item.vlFob) || 0,
          municipios: [],
        })
      }
      arquivosLidos.push(`comexstat-api-general-${tipo}_${range.from}_${range.to}`)
    }

    // SECONDARY: /cities endpoint — ALWAYS call regardless of filters
    try {
      const citiesBody = {
        flow: apiFlow,
        monthDetail: false,
        period: { from: range.from, to: range.to },
        filters: sh4 ? [{ filter: "heading", values: [sh4] }] : [],
        details: ["city", "country", "state"],
        metrics: ["metricFOB", "metricKG"],
      }

      console.log(`[API-COMEXSTAT] POST ${COMEXSTAT_API}/cities:`, JSON.stringify(citiesBody).substring(0, 300))

      const citiesResponse = await fetchWithRetry(`${COMEXSTAT_API}/cities`, citiesBody)

      if (!citiesResponse.ok) {
        console.error(`[API-COMEXSTAT] /cities error: ${citiesResponse.status}`)
      } else {
        const citiesData = await citiesResponse.json()
        const citiesList = citiesData?.data?.list || []
        console.log(`[API-COMEXSTAT] /cities returned ${citiesList.length} records`)

        const regMap = new Map()
        registros.forEach(r => {
          const key = `${r.co_ano}_${r.co_pais}_${r.sg_uf}`
          if (!regMap.has(key)) regMap.set(key, r)
        })

        for (const item of citiesList) {
          const cityName = item.noMunMinsgUf || item.city || item.cityName || item.noMunMin || "Desconhecido"
          // Convert country/state NAMES to codes so keys match /general records
          const rawCountry = String(item.country || item.countryName || item.noPais || item.coPais || "97").normalize('NFC')
          const co_pais = PAIS_NAME_TO_CODE[rawCountry] || rawCountry
          const rawState = String(item.state || item.stateName || item.noUf || item.sgUf || "").normalize('NFC')
          const sg_uf = UF_NAME_TO_CODE[rawState] || (rawState.length >= 2 ? rawState.substring(0,2).toUpperCase() : "")
          const key = `${item.year || range.from.split('-')[0]}_${co_pais}_${sg_uf}`
          const parent = regMap.get(key)
          if (parent && parent.municipios.length < 50) {
            parent.municipios.push({
              co_mun: item.cityCode || "",
              mun_nome: cityName,
              kg_liquido: Number(item.metricKG) || 0,
              vl_fob: Number(item.metricFOB) || 0,
            })
          }
        }
        arquivosLidos.push(`comexstat-api-cities-${tipo}_${range.from}_${range.to}`)
      }
    } catch (_e) { /* best effort */ }

  } catch (err) {
    console.error(`[API-COMEXSTAT] Error:`, err.message)
  }

  console.log(`[API-COMEXSTAT] Total registros: ${registros.length} (com ${registros.reduce((s, r) => s + r.municipios.length, 0)} municípios)`)
  return { registros, arquivos_lidos: arquivosLidos, fonte: 'comexstat-api' }
}

async function analyzeWithGroq(registros, query, groqApiKey, tipo) {
  if (!groqApiKey) return "Análise IA desativada — configure GROQ_API_KEY.";
  if (registros.length === 0) return "Sem dados para análise.";

  const summary = {
    total_registros: registros.length,
    total_fob: registros.reduce((sum, r) => sum + r.vl_fob, 0),
    total_kg: registros.reduce((sum, r) => sum + r.kg_liquido, 0),
    paises: [...new Set(registros.map(r => r.pais_nome))].slice(0, 20),
    ufs: [...new Set(registros.map(r => r.sg_uf).filter(Boolean))].slice(0, 10),
    vias: [...new Set(registros.map(r => r.via_nome))],
    meses: [...new Set(registros.map(r => `${r.mes_nome}/${r.co_ano}`))],
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqApiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `Você é especialista em análise de dados de comércio exterior brasileiro (COMEXSTAT). Responda em português brasileiro. Markdown, emojis, conciso. Valores em USD (FOB).`
        },
        {
          role: "user",
          content: `Dados de ${tipo === 'IMP' ? 'importação' : 'exportação'}:\n${JSON.stringify(summary, null, 2)}\n\nPergunta: ${query}\n\nAnálise detalhada.`
        }
      ]
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Groq ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Não foi possível gerar análise."
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const GROQ_KEY = Deno.env.get('GROQ_API_KEY') || ''

    let body = {}
    try {
      body = await req.json()
    } catch {
      const url = new URL(req.url)
      body = {
        ncm: url.searchParams.get('ncm') || '',
        ano: url.searchParams.get('ano') || '2025',
        mes: url.searchParams.get('mes') || '',
        anoDe: url.searchParams.get('anoDe') || '',
        mesDe: url.searchParams.get('mesDe') || '',
        anoAte: url.searchParams.get('anoAte') || '',
        mesAte: url.searchParams.get('mesAte') || '',
        uf: url.searchParams.get('uf') || '',
        pais: url.searchParams.get('pais') || '',
        via: url.searchParams.get('via') || '',
        descricao: url.searchParams.get('descricao') || '',
        analise: url.searchParams.get('analise') || '',
        modo: url.searchParams.get('modo') || 'dados',
        tipo: url.searchParams.get('tipo') || 'EXP',
      }
    }

    const ncm = body.ncm || ''
    const uf = body.uf || ''
    const pais = body.pais || ''
    const via = body.via || ''
    const tipo = (body.tipo || 'IMP')
    const modo = body.modo || 'dados'
    const analise = body.analise || ''
    const descricao = body.descricao || ''

    const range = parseDateRange(body)
    console.log(`[REQUEST] modo=${modo} tipo=${tipo} ncm=${ncm} period=${range.from}..${range.to}`)

    // MODE: buscar_ncm
    if (modo === 'buscar_ncm' && descricao && GROQ_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.1, max_tokens: 512,
          response_format: { type: "json_object" },
          messages: [{
            role: "system",
            content: `Especialista NCM brasileiro. Retorne JSON: { "sugestoes": [{ "ncm":"84821010", "descricao":"Descrição PT-BR", "confianca":"alta" }] }. Máx 5.`
          }, {
            role: "user", content: `NCM para: "${descricao}"`
          }]
        }),
      })

      if (!response.ok) throw new Error(`Groq error: ${response.status}`)
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      try {
        const clean = content.replace(/```json|```/g, '').trim()
        const result = JSON.parse(clean)
        return new Response(JSON.stringify({ sugestoes: result.sugestoes || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch {
        return new Response(JSON.stringify({ sugestoes: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Fetch data from Comexstat API
    const fetchResult = await fetchFromComexstatApi(tipo, ncm, uf, pais, via, MAX_REGISTROS, range)

    // MODE: AI analysis
    if (modo === 'analisar' && analise && GROQ_KEY && fetchResult.registros.length > 0) {
      const groqAnalysis = await analyzeWithGroq(fetchResult.registros, analise, GROQ_KEY, tipo)
      return new Response(JSON.stringify({
        registros: fetchResult.registros,
        total: fetchResult.registros.length,
        arquivos_lidos: fetchResult.arquivos_lidos,
        analise: groqAnalysis,
        fonte: fetchResult.fonte,
        tipo_operacao: tipo,
        periodo: { from: range.from, to: range.to },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // MODE: buscar_cnpjs — suggest real companies using Groq
    if (modo === 'buscar_cnpjs' && GROQ_KEY && fetchResult.registros.length > 0) {
      const topCities = fetchResult.registros
        .flatMap(r => r.municipios || [])
        .reduce((acc, m) => {
          acc[m.mun_nome] = (acc[m.mun_nome] || 0) + m.vl_fob
          return acc
        }, {})
      const sortedCities = Object.entries(topCities).sort((a, b) => b[1] - a[1]).slice(0, 10)
      const topUfs = [...new Set(fetchResult.registros.map(r => r.uf_nome).filter(Boolean))].slice(0, 5)
      const topPaises = [...new Set(fetchResult.registros.map(r => r.pais_nome))].slice(0, 5)

      const prompt = `Com base nos dados de ${tipo === 'EXP' ? 'EXPORTAÇÃO' : 'IMPORTAÇÃO'} brasileira do produto com código NCM ${ncm || '8482'} (Máquinas/Equipamentos), nos anos ${range.from} a ${range.to}, nos estados ${topUfs.join(', ')}, para os países ${topPaises.join(', ')}, e nas principais cidades ${sortedCities.map(c => c[0]).join(', ')}:

Liste 5 a 10 empresas brasileiras REAIS que provavelmente ${tipo === 'EXP' ? 'exportam' : 'importam'} este produto. Para cada empresa, inclua:
- Nome da empresa (nome comercial conhecido)
- Cidade/UF
- Segmento de atuação
- Estimativa de volume (pequeno, médio, grande exportador/importador)

IMPORTANTE: Use apenas nomes de empresas REALMENTE existentes no Brasil. Não invente empresas. Se não tiver certeza, indique "Empresa não confirmada".

Responda em formato JSON:
{
  "empresas": [
    { "nome": "Nome da Empresa", "cidade": "Cidade - UF", "segmento": "Descrição", "porte": "grande/médio/pequeno", "fonte": "Censo/Factiva/MDIC" }
  ]
}`

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Você é especialista em comércio exterior brasileiro. Liste apenas empresas REAIS. Nunca invente empresas." },
            { role: "user", content: prompt }
          ]
        }),
      })

      if (!response.ok) {
        return new Response(JSON.stringify({ empresas: [], error: "Groq error" }), { headers: corsHeaders })
      }
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      try {
        const clean = content.replace(/```json|```/g, '').trim()
        const result = JSON.parse(clean)
        return new Response(JSON.stringify({
          empresas: result.empresas || [],
          cidades: sortedCities.map(([nome, fob]) => ({ nome, vl_fob: fob })),
          ufs: topUfs,
          paises: topPaises,
          tipo_operacao: tipo,
          periodo: { from: range.from, to: range.to },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } catch (e) {
        return new Response(JSON.stringify({ empresas: [], error: e.message }), { headers: corsHeaders })
      }
    }

    // MODE: Return data
    return new Response(JSON.stringify({
      registros: fetchResult.registros,
      total: fetchResult.registros.length,
      arquivos_lidos: fetchResult.arquivos_lidos,
      tipo_operacao: tipo,
      fonte: fetchResult.fonte,
      periodo: { from: range.from, to: range.to },
      debug: { filtros: { ncm, uf, pais, via, tipo, period: `${range.from}..${range.to}` } }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[ERROR]', error.message)
    return new Response(JSON.stringify({
      error: error.message,
      registros: [],
      total: 0,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
