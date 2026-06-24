import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCADO_PAGO_API = 'https://api.mercadopago.com'
const STRIPE_API = 'https://api.stripe.com/v1'

/* ─── HELPERS ─── */

function getMPToken(): string {
  const token = Deno.env.get('MP_ACCESS_TOKEN')
  if (!token) throw new Error('MP_ACCESS_TOKEN not configured')
  return token
}

function getStripeKey(): string {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return key
}

async function mpFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getMPToken()
  const url = `${MERCADO_PAGO_API}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('[mp-api] Error:', path, res.status, JSON.stringify(data))
    throw new Error(`Mercado Pago API error (${res.status}): ${data.message || JSON.stringify(data)}`)
  }
  return data
}

async function stripeFetch(path: string, body: URLSearchParams): Promise<any> {
  const key = getStripeKey()
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('[stripe-api] Error:', path, res.status, JSON.stringify(data))
    throw new Error(`Stripe API error (${res.status}): ${data.error?.message || JSON.stringify(data)}`)
  }
  return data
}

/* ─── PLAN CONFIG ─── */

const PLAN_CONFIG: Record<string, { costMultiplier: number }> = {
  growth: { costMultiplier: 1.0 },
  professional: { costMultiplier: 0.4 },
  business: { costMultiplier: 0.2 },
  enterprise: { costMultiplier: 0.0 },
}

/* ─── UPGRADE USER ─── */

async function upgradeUserPlan(userId: string, planId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!userId || !supabaseKey) return

  const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await fetch(`${supabaseUrl}/rest/v1/user_usage?user_id=eq.${userId}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      plan_type: planId,
      used_percent: 0,
      tank_percent: 100,
      reset_date: resetDate,
    }),
  })
}

async function recordPayment(userId: string, planId: string, amount: number, currency: string, provider: string, paymentId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!userId || !supabaseKey) return

  await fetch(`${supabaseUrl}/rest/v1/payments`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      user_id: userId,
      amount,
      currency,
      status: 'approved',
      provider,
      provider_payment_id: paymentId,
      plan_type: planId,
    }),
  })
}

/* ─── WEBHOOK: MERCADO PAGO ─── */

async function handleMPWebhook(req: Request): Promise<Response> {
  const body = await req.json()
  console.log('[mp-webhook] Received:', JSON.stringify(body))

  const { type, data, action } = body
  let paymentId: string | null = null

  if (type === 'payment' && data?.id) {
    paymentId = String(data.id)
  } else if (action === 'payment.created' || action === 'payment.updated') {
    paymentId = body?.data?.id ? String(body.data.id) : null
  }

  if (!paymentId) {
    return new Response('OK', { status: 200, headers: corsHeaders })
  }

  try {
    const payment = await mpFetch(`/v1/payments/${paymentId}`)
    console.log('[mp-webhook] Payment:', payment.id, 'status:', payment.status)

    if (payment.status === 'approved' && payment.external_reference) {
      const parts = payment.external_reference.split('::')
      const planId = parts[0]
      const userId = parts.length > 1 ? parts[1] : null

      if (planId && userId) {
        await upgradeUserPlan(userId, planId)
        await recordPayment(userId, planId, payment.transaction_amount, 'BRL', 'mercado_pago', String(payment.id))
        console.log(`[mp-webhook] ✅ Plan upgraded: ${planId} for user ${userId}`)
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error('[mp-webhook] Error:', err.message)
    return new Response('OK', { status: 200, headers: corsHeaders })
  }
}

/** Webhook handler quando o body já foi parseado (detectado por conteúdo, não por path) */
async function handleMPWebhookFromBody(body: any): Promise<Response> {
  console.log('[mp-webhook-body] Received:', JSON.stringify(body))

  const { type, data, action } = body
  let paymentId: string | null = null

  if (type === 'payment' && data?.id) {
    paymentId = String(data.id)
  } else if (action === 'payment.created' || action === 'payment.updated') {
    paymentId = body?.data?.id ? String(body.data.id) : null
  }

  if (!paymentId) {
    return new Response('OK', { status: 200, headers: corsHeaders })
  }

  try {
    const payment = await mpFetch(`/v1/payments/${paymentId}`)
    console.log('[mp-webhook-body] Payment:', payment.id, 'status:', payment.status)

    if (payment.status === 'approved' && payment.external_reference) {
      const parts = payment.external_reference.split('::')
      const planId = parts[0]
      const userId = parts.length > 1 ? parts[1] : null

      if (planId && userId) {
        await upgradeUserPlan(userId, planId)
        await recordPayment(userId, planId, payment.transaction_amount, 'BRL', 'mercado_pago', String(payment.id))
        console.log(`[mp-webhook-body] ✅ Plan upgraded: ${planId} for user ${userId}`)
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error('[mp-webhook-body] Error:', err.message)
    return new Response('OK', { status: 200, headers: corsHeaders })
  }
}

/* ─── WEBHOOK: STRIPE ─── */

async function handleStripeWebhook(req: Request): Promise<Response> {
  const sig = req.headers.get('stripe-signature') || ''
  const body = await req.text()

  // In production, verify webhook signature with STRIPE_WEBHOOK_SECRET
  // For now, parse the raw body
  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
  }

  console.log('[stripe-webhook] Event:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const externalRef = session.client_reference_id || '' // plan_id::user_id
    const parts = externalRef.split('::')
    const planId = parts[0]
    const userId = parts.length > 1 ? parts[1] : null
    const amount = (session.amount_total || 0) / 100
    const currency = (session.currency || 'usd').toUpperCase()

    if (planId && userId) {
      await upgradeUserPlan(userId, planId)
      await recordPayment(userId, planId, amount, currency, 'stripe', session.id)
      console.log(`[stripe-webhook] ✅ Plan upgraded: ${planId} for user ${userId}`)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/* ─── CREATE MERCADO PAGO PREFERENCE ─── */

async function createMPPreference(params: {
  plan_id: string; user_id: string; price_cents: number;
  title: string; description?: string; back_urls?: any;
}): Promise<Response> {
  const { plan_id, user_id, price_cents, title, description, back_urls } = params

  const successUrl = back_urls?.success || 'https://www.tradexa.com.br/plans?status=approved'
  const failureUrl = back_urls?.failure || 'https://www.tradexa.com.br/plans?status=rejected'
  const pendingUrl = back_urls?.pending || 'https://www.tradexa.com.br/plans?status=pending'

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const notificationUrl = `${supabaseUrl}/functions/v1/payment-gateway`

  const preference = await mpFetch('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [{
        id: plan_id,
        title,
        description: description || title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: price_cents / 100,
      }],
      external_reference: `${plan_id}::${user_id}`,
      notification_url: notificationUrl,
      back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
      auto_return: 'approved',
      statement_descriptor: 'TRADEXA',
    }),
  })

  console.log('[mp] Preference created:', preference.id)

  // Se o token for de teste (TEST-), usar sandbox_init_point; senão, init_point de produção
  const isTestToken = getMPToken().startsWith('TEST-')
  const checkoutUrl = isTestToken ? preference.sandbox_init_point : preference.init_point
  console.log('[mp] Token mode:', isTestToken ? 'sandbox' : 'production', '→', checkoutUrl)

  return new Response(JSON.stringify({
    success: true,
    provider: 'mercado_pago',
    preference_id: preference.id,
    url: checkoutUrl,           // ← campo unificado para frontend
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/* ─── CREATE STRIPE CHECKOUT SESSION ─── */

async function createStripeSession(params: {
  plan_id: string; user_id: string; price_cents: number;
  title: string; description?: string; back_urls?: any;
}): Promise<Response> {
  const { plan_id, user_id, price_cents, title, description, back_urls } = params

  const successUrl = back_urls?.success || 'https://www.tradexa.com.br/plans?status=approved'
  const cancelUrl = back_urls?.failure || 'https://www.tradexa.com.br/plans?status=rejected'

  const formBody = new URLSearchParams({
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'brl',
    'line_items[0][price_data][product_data][name]': title,
    'line_items[0][price_data][product_data][description]': description || `Plano TRADEXA ${plan_id}`,
    'line_items[0][price_data][unit_amount]': String(price_cents),
    'line_items[0][quantity]': '1',
    'mode': 'payment',
    'success_url': successUrl,
    'cancel_url': cancelUrl,
    'client_reference_id': `${plan_id}::${user_id}`,
    'metadata[plan_id]': plan_id,
    'metadata[user_id]': user_id,
  })

  const session = await stripeFetch('/checkout/sessions', formBody)

  console.log('[stripe] Session created:', session.id)

  return new Response(JSON.stringify({
    success: true,
    provider: 'stripe',
    session_id: session.id,
    url: session.url,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/* ─── MAIN ─── */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/+/, '')

  // Webhook routing — by path OR by body content (MP sends to /functions/v1/payment-gateway)
  if (path.includes('webhook') || path.includes('stripe-webhook')) {
    const stripeSig = req.headers.get('stripe-signature')
    if (stripeSig) {
      return handleStripeWebhook(req)
    }
    return handleMPWebhook(req)
  }

  // Parse body — but first check if it looks like a webhook (MP IPN)
  const body = await req.json()

  // Detect webhook by body format: Mercado Pago sends { type, action, data } or { action, data }
  if (body.type === 'payment' || body.action?.startsWith('payment.')) {
    return handleMPWebhookFromBody(body)
  }

  // Create checkout
  const { plan_id, user_id, price_cents, title, description, back_urls, provider } = body

  if (!plan_id || !user_id || !price_cents || !title) {
    return new Response(JSON.stringify({ error: 'Missing required fields: plan_id, user_id, price_cents, title' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // If Stripe is requested AND stripe key is configured, use Stripe
  if (provider === 'stripe') {
    try {
      return await createStripeSession({ plan_id, user_id, price_cents, title, description, back_urls })
    } catch (err: any) {
      console.error('[stripe] Failed, falling back to Mercado Pago:', err.message)
      // Fall through to Mercado Pago
    }
  }

  // Default: Mercado Pago
  try {
    return await createMPPreference({ plan_id, user_id, price_cents, title, description, back_urls })
  } catch (err: any) {
    console.error('[mp] Failed:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
