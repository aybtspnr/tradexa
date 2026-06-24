import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GROQ_MODEL = "llama-3.3-70b-versatile"

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

    const { messages, system } = await req.json()
    const safeMessages = Array.isArray(messages) ? messages.map((m: any) => ({
      role: m.role || 'user',
      content: String(m.content || ''),
    })) : []

    const systemPrompt = system || `Você é o assistente inteligente TRADEXA, especialista em comércio exterior brasileiro.
Você ajuda analistas e empresários a interpretar dados de exportação e importação (NCM, tarifas, mercados, tendências).
Responda em português brasileiro, de forma técnica mas acessível.
Use markdown para formatação, emojis com moderação, e seja conciso.
Você pode sugerir códigos NCM, comparar mercados, explicar regulamentos e calcular métricas comerciais.`

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        ...safeMessages,
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
      console.error(`[groq-chat] Groq error ${resp.status}: ${text}`)
      return new Response(JSON.stringify({ error: `Groq ${resp.status}: ${text}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await resp.json()
    const content = data.choices?.[0]?.message?.content || "Nenhuma resposta gerada."
    const usage = data.usage || {}

    return new Response(JSON.stringify({ content, usage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[groq-chat] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
