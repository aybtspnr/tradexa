import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const REQUEST_TIMEOUT_MS = 25000

async function callGroq(apiKey: string, messages: unknown[], temperature: number, max_tokens: number): Promise<string | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens,
        messages,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Groq HTTP ${res.status}: ${text}`)
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } finally {
    clearTimeout(timeoutId)
  }
}

function safeParseJson(content: string | null | undefined): any[] {
  if (!content) return []
  try {
    const cleaned = content.replace(/```json\s*|```\s*$/gi, "").trim()
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : parsed.results || parsed.data || []
  } catch {
    return []
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json()
    const query = (body.query as string) || ""
    const country = (body.country as string) || "BR"

    if (!query.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const isCode = /^\d{2,8}$/.test(query.replace(/\D/g, ""))

    const messages = [
      {
        role: "system",
        content: `Você é especialista em classificação HS (Harmonized System) e tarifas alfandegárias.

Para consultas de códigos HS ou descrições de produtos, retorne um array JSON com os resultados mais relevantes.

Formato de resposta (apenas JSON, sem markdown):
[
  {
    "code": "6203.42.11",
    "description": "Calças de algodão para homens ou meninos",
    "country": "Brasil",
    "duty_rate": "10% (II)",
    "vat_rate": "17% (IPI)",
    "additional_taxes": "PIS 1.65% + COFINS 7.6%",
    "notes": "Exige Certificado de Origem para países do Mercosul"
  }
]

Regras:
- Se o query for código numérico, busque o HS base de 6 dígitos (ex: 620342 em vez de 6203.42.11)
- Se for descrição em português, sugira os códigos HS de 6 dígitos mais prováveis
- Inclua tarifas típicas do país solicitado
- Limite a 5 resultados
- Seja preciso e técnico`,
      },
      {
        role: "user",
        content: `Query: "${query}"
País de referência para tarifas: ${country === "BR" ? "Brasil" : country === "US" ? "Estados Unidos" : country}

Retorne APENAS o array JSON.`,
      },
    ]

    const content = await callGroq(GROQ_API_KEY, messages, 0.2, 2048)
    const results = safeParseJson(content)

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err: any) {
    console.error("[hs-lookup] Error:", err?.message || err)
    return new Response(JSON.stringify({ results: [], error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
