import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.text()
    const event = JSON.parse(body)

    const eventType = event.type
    const data = event.data?.object

    if (!data) {
      return new Response(JSON.stringify({ error: 'No data in event' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Chama Supabase REST API diretamente
    const supabaseRest = (table: string, method: string, body: any) =>
      fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
          'Prefer': method === 'POST' ? 'return=minimal' : '',
        },
        body: JSON.stringify(body),
      })

    if (eventType === 'checkout.session.completed') {
      const customerId = data.customer
      const userId = data.client_reference_id || data.metadata?.user_id
      const plan = data.metadata?.plan || 'professional'
      const subscriptionId = data.subscription

      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing user_id in metadata' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Cria subscription
      const subResult = await supabaseRest('subscriptions', 'POST', {
        user_id: userId,
        plan: plan,
        status: 'active',
        stripe_subscription_id: subscriptionId,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (!subResult.ok) {
        const err = await subResult.text()
        console.error('[stripe-webhook] Error creating subscription:', err)
        return new Response(JSON.stringify({ error: err }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Habilita feature importers_directory
      // Primeiro pega o ID da subscription criada
      const subsList = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&order=created_at.desc&limit=1`, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        },
      }).then(r => r.json())

      const subId = subsList?.[0]?.id
      if (subId) {
        await supabaseRest('subscription_features', 'POST', {
          subscription_id: subId,
          feature: 'importers_directory',
          enabled: true,
        })
      }

      console.log(`[stripe-webhook] Subscription created for user ${userId}`)
    }

    if (eventType === 'customer.subscription.deleted') {
      const subscriptionId = data.id

      // Atualiza subscription
      await supabaseRest('subscriptions', 'PATCH', {
        status: 'canceled',
      })

      // Desabilita feature
      // Busca subscription pelo stripe_subscription_id e atualiza
      const subs = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscriptionId}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        },
      }).then(r => r.json())

      for (const sub of subs || []) {
        await supabaseRest('subscription_features', 'PATCH', {
          enabled: false,
        })
      }

      console.log(`[stripe-webhook] Subscription ${subscriptionId} canceled`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('[stripe-webhook] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
