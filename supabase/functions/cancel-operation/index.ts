import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { quoteId } = await req.json()
    console.log(`[cancel-operation] Iniciando cancelamento total para cotação: ${quoteId}`)

    // 1. Atualiza a cotação para Cancelada
    const { error: qError } = await supabaseAdmin
      .from('quotes')
      .update({ status: 'Cancelada' })
      .eq('id', quoteId)

    if (qError) throw qError

    // 2. Atualiza qualquer envio vinculado para Cancelado
    const { error: sError } = await supabaseAdmin
      .from('shipments')
      .update({ 
        status: 'Cancelado', 
        updated_at: new Date().toISOString(),
        notes: 'Operação cancelada pelo sistema.'
      })
      .eq('quote_id', quoteId)

    // 3. Marca propostas pendentes como rejeitadas (opcional, mas limpa o banco)
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('quote_id', quoteId)
      .eq('status', 'pending')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[cancel-operation] Erro crítico:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})