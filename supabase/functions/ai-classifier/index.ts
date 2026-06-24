import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const REQUEST_TIMEOUT_MS = 25000

/* ─── helpers ─── */

/** Strip markdown fences and parse JSON safely. */
function safeParseJson<T>(content: string | null | undefined, fallback: T): T {
  if (!content) {
    return fallback
  }
  try {
    const cleaned = content.replace(/```json\s*|```\s*$/gi, "").trim()
    return JSON.parse(cleaned) as T
  } catch (e) {
    console.error("[ai-classifier] JSON parse failed:", e, "Raw:", content.substring(0, 200))
    return fallback
  }
}

/** Single point of contact for Groq. Always clears its own timeout. */
async function callGroq(
  apiKey: string,
  messages: unknown[],
  temperature: number,
  max_tokens: number,
  responseFormat?: { type: string }
): Promise<string | null> {
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
        ...(responseFormat ? { response_format: responseFormat } : {}),
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

/* ─── build fallback per mode ─── */

function buildFallback(body: any, mode: string): unknown {
  const descricao = (body?.descricao as string) || ""

  if (mode === "translate_only") {
    return {
      keyword_en: descricao,
      keywords_alternatives: descricao ? [descricao] : [],
    }
  }

  if (mode === "choose_headings" || mode === "classify" || mode === "default") {
    const api_results = body?.api_results || []
    const counts: Record<string, number> = {}
    api_results.forEach((item: any) => {
      const h = item.htsno?.replace(/\D/g, "").substring(0, 4) || ""
      if (h) counts[h] = (counts[h] || 0) + 1
    })
    const mostCommon =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

    return {
      primary_heading: mostCommon,
      best_headings: mostCommon ? [mostCommon] : [],
      reasoning: "Fallback: erro no servidor ou Groq indisponível",
      must_contain: [],
      must_not_contain: [],
      confidence: 50,
    }
  }

  if (mode === "clarify") {
    return { needs_clarification: false }
  }

  return { error: `Unknown mode: ${mode}` }
}

/* ─── main handler ─── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")
  if (!GROQ_API_KEY) {
    console.error("[ai-classifier] GROQ_API_KEY not configured")
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  let body: any = {}
  let mode = "default"

  try {
    body = await req.json()
    // classifierType may be present in body but is intentionally not used
    mode = body.mode || "default"
    const descricao = (body.descricao as string) || ""
    const api_results = body.api_results

    console.log("[ai-classifier] mode=", mode, "| descricao=", descricao)

    /* ── MODO: translate_only ── */
    if (mode === "translate_only") {
      const messages = [
        {
          role: "system",
          content: `You are a US customs classification expert translator.

Translate product descriptions from Portuguese to technical English for HTS API searches.

Return ONLY JSON:
{
  "keyword_en": "men's cotton knit shirt",
  "keywords_alternatives": ["cotton shirt men", "knit shirt cotton men"]
}

RULES:
- Describe the COMPLETE product, never just material
- Use American customs technical terminology
- WRONG: "cotton"
- RIGHT: "men's cotton knit shirt"
- Include: gender, material, construction (knit/woven), product type
- Keep it concise for API search (5-8 words max)`,
        },
        {
          role: "user",
          content: `Produto em português: "${descricao}"

Retorne APENAS o JSON.`,
        },
      ]

      const content = await callGroq(GROQ_API_KEY, messages, 0.3, 256, { type: "json_object" })
      const fallback = buildFallback(body, mode)
      const result = safeParseJson(content, fallback)
      console.log("[ai-classifier] translate result:", result)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    /* ── MODO: classify / choose_headings / default ── */
    if (mode === "classify" || mode === "choose_headings" || mode === "default") {
      if (!api_results || !Array.isArray(api_results)) {
        return new Response(JSON.stringify({ error: "api_results required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const headingsInResults = [
        ...new Set(
          api_results
            .map((r: any) => r.htsno?.replace(/\D/g, "").substring(0, 4))
            .filter(Boolean)
        ),
      ]

      console.log("[ai-classifier] headings found:", headingsInResults)

      const messages = [
        {
          role: "system",
          content: `You are an HTS (Harmonized Tariff Schedule) classification expert.

Analyze REAL API results and choose the best headings.

MANDATORY RULES:
- Choose ONLY headings that exist in the provided list
- NEVER invent a heading
- Consider material, use, type, and gender
- Prefer headings with more 10-digit results
- Return 1-2 headings maximum

Return ONLY JSON:
{
  "primary_heading": "6105",
  "best_headings": ["6105", "6109"],
  "reasoning": "6105 is specific for men's cotton knit shirts",
  "must_contain": ["cotton"],
  "must_not_contain": ["wool", "leather", "babies"],
  "confidence": 85
}`,
        },
        {
          role: "user",
          content: `Produto em português: "${descricao}"

Headings disponíveis nos resultados da API: ${JSON.stringify(headingsInResults)}

Resultados reais da API USITC (primeiros 60):
${JSON.stringify(
  api_results.slice(0, 60).map((r: any) => ({
    htsno: r.htsno,
    description: r.description,
  }))
)}

Escolha os 1 ou 2 headings (4 dígitos) que melhor classificam este produto.

Retorne APENAS o JSON.`,
        },
      ]

      const content = await callGroq(GROQ_API_KEY, messages, 0.1, 1024, { type: "json_object" })
      const fallback = buildFallback(body, mode)
      const result = safeParseJson(content, fallback)
      console.log("[ai-classifier] classify result:", result)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    /* ── MODO: clarify ── */
    if (mode === "clarify") {
      const messages = [
        {
          role: "system",
          content: `Você é especialista em classificação fiscal HTS.

Decida se a descrição precisa de mais informação.

REGRA: Se já tem material + tipo + uso → needs_clarification: false
Se falta informação → needs_clarification: true + 1 pergunta com 4 opções

Retorne APENAS JSON:
{
  "needs_clarification": true/false,
  "question": "Qual o material?",
  "options": ["Algodão", "Poliéster", "Lã", "Não sei"]
}`,
        },
        {
          role: "user",
          content: `Produto: "${descricao}"

Responda APENAS o JSON.`,
        },
      ]

      const content = await callGroq(GROQ_API_KEY, messages, 0.3, 256, { type: "json_object" })
      const fallback = buildFallback(body, mode)
      const result = safeParseJson(content, fallback)
      console.log("[ai-classifier] clarify result:", result)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    /* ── unknown mode ── */
    console.error("[ai-classifier] Unknown mode:", mode)
    return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  /* ── single catch for ALL fetch / logic errors ── */
  } catch (err: any) {
    console.error("[ai-classifier] Caught error:", err?.message || err)
    const fallback = buildFallback(body, mode)

    // If the fallback itself signals an unknown mode, return 400; otherwise 200 with fallback
    if ((fallback as any).error) {
      return new Response(JSON.stringify(fallback), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
