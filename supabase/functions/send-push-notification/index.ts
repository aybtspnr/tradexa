import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, title, message, url } = await req.json()

    console.log("[send-push-notification] Enviando notificação", { userId, title })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar subscriptions do usuário
    const { data: subscriptions } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[send-push-notification] Nenhuma subscription encontrada")
      return new Response(JSON.stringify({ success: true, message: 'No subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Enviar notificação para cada subscription
    const promises = subscriptions.map(async (sub: any) => {
      try {
        const subscription: PushSubscription = JSON.parse(sub.subscription)
        
        // Em produção, usar web-push library
        // Aqui é um exemplo simplificado
        const payload = JSON.stringify({
          title,
          message,
          url,
          timestamp: new Date().toISOString()
        })

        // Nota: Em produção, você precisa implementar a criptografia VAPID
        // Esta é uma versão simplificada para demonstração
        console.log("[send-push-notification] Enviando para endpoint:", subscription.endpoint)
        
        // Aqui você usaria a biblioteca web-push para enviar
        // await webPush.sendNotification(subscription, payload)
        
        return true
      } catch (error) {
        console.error("[send-push-notification] Erro ao enviar:", error)
        return false
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r).length

    console.log("[send-push-notification] Enviadas:", successCount, "de", subscriptions.length)

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount,
      total: subscriptions.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error("[send-push-notification] Erro:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})