import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_API_KEY") || ''
    if (!DEEPSEEK_KEY) {
      return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY não configurada no backend" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const body = await req.json()
    const { messages, model, temperature, max_tokens, response_format } = body

    const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: model || "deepseek-chat",
        messages,
        temperature: temperature ?? 0.3,
        max_tokens: max_tokens ?? 1024,
        ...(response_format ? { response_format } : {}),
      }),
    })

    if (!aiResponse.ok) {
      const text = await aiResponse.text()
      return new Response(JSON.stringify({ error: `DeepSeek API ${aiResponse.status}: ${text}` }), {
        status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const data = await aiResponse.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
