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
    const { searchType, keyword, from, to } = await req.json()

    let url: string

    if (searchType === 'search') {
      url = `https://hts.usitc.gov/reststop/search?keyword=${encodeURIComponent(keyword || '')}`
    } else if (searchType === 'export') {
      url = `https://hts.usitc.gov/reststop/exportList?from=${from}&to=${to}&format=JSON&styles=false`
    } else {
      throw new Error('Tipo de busca inválido. Use "search" ou "export".')
    }

    console.log('[hts-search] Fetching:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('[hts-search] Error:', error.message)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})