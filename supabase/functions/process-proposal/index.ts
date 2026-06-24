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

    const { proposalId, quoteId, partnerId } = await req.json()

    console.log(`[process-proposal] Iniciando processamento: Proposta ${proposalId}, Cotação ${quoteId}`)

    // 1. Atualizar a proposta aceita
    const { error: pError } = await supabaseAdmin
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('id', proposalId)

    if (pError) throw pError

    // 2. Atualizar a cotação para 'Aceita'
    const { error: qError } = await supabaseAdmin
      .from('quotes')
      .update({ status: 'Aceita' })
      .eq('id', quoteId)

    if (qError) throw qError

    // 3. Criar o registro de envio (Shipment)
    const { error: sError } = await supabaseAdmin
      .from('shipments')
      .insert({
        quote_id: quoteId,
        proposal_id: proposalId,
        status: 'Aguardando Coleta'
      })

    if (sError) throw sError

    // 4. Recusar outras propostas da mesma cotação
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('quote_id', quoteId)
      .neq('id', proposalId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[process-proposal] Erro:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})