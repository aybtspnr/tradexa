import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[admin-create-user] === INICIANDO ===")
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log("[admin-create-user] Client criado com SERVICE_ROLE_KEY")

    // Parse request body
    const body = await req.json()
    console.log("[admin-create-user] Body:", JSON.stringify(body, null, 2))
    
    const { email, password, role, company_name, cnpj, partner_type, coverage_type, modals, regions } = body

    // Validate required fields
    if (!email || !password || !company_name) {
      return new Response(JSON.stringify({ error: 'Email, senha e nome da empresa são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log("[admin-create-user] Criando usuário no Auth:", email)

    // 1. Criar o usuário no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        company_name,
        cnpj,
        partner_type,
        coverage_type,
        modals,
        regions
      }
    })

    if (authError) {
      console.error("[admin-create-user] Erro Auth:", authError)
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = authData.user.id
    console.log("[admin-create-user] Usuário criado:", userId)

    // 2. Determinar status baseado no role
    const status = (role === 'partner' || role === 'trucker') ? 'pending' : 'approved'

    // 3. Criar perfil na tabela profiles (usando upsert para evitar duplicação)
    const profileData = {
      id: userId,
      email,
      role,
      company_name,
      cnpj: cnpj || null,
      status,
      partner_type: partner_type || null,
      coverage_type: coverage_type || null,
      modals: modals || [],
      regions: regions || [],
      updated_at: new Date().toISOString()
    }

    console.log("[admin-create-user] Criando perfil:", profileData)

    const { data: profileDataResult, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      console.error("[admin-create-user] Erro Profile:", profileError)
      // Mesmo com erro no profile, retornamos sucesso pois o usuário foi criado no auth
      return new Response(JSON.stringify({ 
        success: true, 
        user: authData.user,
        profile_error: profileError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log("[admin-create-user] === SUCESSO ===")

    return new Response(JSON.stringify({ 
      success: true,
      user: authData.user,
      profile: profileDataResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[admin-create-user] Erro crítico:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})