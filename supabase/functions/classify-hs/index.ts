import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GROQ_MODEL = "llama-3.1-8b-instant"

// Mapeamento dos capítulos HS disponíveis no banco (01-50, 60-61)
const AVAILABLE_HS = [
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","32","33","34","35","36","37","38","39","40",
  "41","42","43","44","45","46","47","48","49","50",
  "60","61"
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const GROQ_KEY = Deno.env.get('GROQ_API_KEY') || ''
    if (!GROQ_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const hsList = AVAILABLE_HS.map(h => {
      // Nome amigável básico
      const names: Record<string, string> = {
        "01": "Animais vivos", "02": "Carnes", "03": "Peixes e frutos do mar",
        "04": "Leite e produtos lácteos", "05": "Produtos de origem animal",
        "06": "Plantas e flores", "07": "Vegetais", "08": "Frutas",
        "09": "Café, chá e especiarias", "10": "Cereais",
        "11": "Produtos de moagem", "12": "Óleos e gorduras vegetais",
        "13": "Gomas e resinas", "14": "Matérias de entrançar",
        "15": "Gorduras e óleos", "16": "Preparações de carne/peixe",
        "17": "Açúcares", "18": "Cacau", "19": "Preparações de cereais",
        "20": "Preparações de vegetais/frutas", "21": "Preparações alimentícias diversas",
        "22": "Bebidas", "23": "Resíduos alimentares", "24": "Tabaco",
        "25": "Sal, pedras e minerais", "26": "Minérios", "27": "Combustíveis",
        "28": "Produtos químicos inorgânicos", "29": "Produtos químicos orgânicos",
        "30": "Farmacêuticos", "31": "Adubos", "32": "Tintas e corantes",
        "33": "Óleos essenciais e cosméticos", "34": "Sabões e detergentes",
        "35": "Matérias albuminóides", "36": "Explosivos",
        "37": "Produtos fotográficos", "38": "Produtos químicos diversos",
        "39": "Plásticos", "40": "Borracha", "41": "Couros",
        "42": "Obras de couro", "43": "Peleteria", "44": "Madeira",
        "45": "Cortiça", "46": "Obras de espartaria", "47": "Pasta de papel",
        "48": "Papel e cartão", "49": "Livros e impressos", "50": "Seda",
        "60": "Tecidos de malha", "61": "Vestuário de malha"
      }
      return `${h}: ${names[h] || 'Outros'}`
    }).join("\n")

    const systemPrompt = `Você é um classificador de produtos em códigos HS (Harmonized System).
Classifique o produto descrito pelo usuário em um dos capítulos HS de 2 dígitos disponíveis.

Capítulos disponíveis:
${hsList}

Responda APENAS com um JSON no formato:
{"hs_chapter": "XX", "description": "nome amigável em português", "confidence": 0.95}

Se não tiver certeza, responda com o capítulo mais provável e confidence menor.`

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    }

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error(`[classify-hs] Groq error ${resp.status}: ${text}`)
      return new Response(JSON.stringify({ error: `Groq ${resp.status}: ${text}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await resp.json()
    const content = data.choices?.[0]?.message?.content || "{}"

    let result: any
    try {
      result = JSON.parse(content)
    } catch {
      // Fallback: try to extract JSON from markdown
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          result = JSON.parse(match[0])
        } catch {
          result = {}
        }
      } else {
        result = {}
      }
    }

    // Validate hs_chapter is in available list and confidence is sufficient
    const hs = result.hs_chapter?.toString().padStart(2, '0') || ""
    const confidence = Number(result.confidence) || 0.5
    if (!AVAILABLE_HS.includes(hs) || confidence <= 0.5) {
      return new Response(JSON.stringify({
        error: 'Could not classify into available HS chapters with sufficient confidence',
        hs_chapter: hs || null,
        confidence,
        raw: result,
      }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      hs_chapter: hs,
      description: result.description || "Produto",
      confidence,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('[classify-hs] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
