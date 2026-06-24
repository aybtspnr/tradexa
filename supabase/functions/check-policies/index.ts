import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Check if admin_policies exist
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc(
      "check_admin_policies"
    )

    if (policiesError) {
      // Function doesn't exist - need to apply migration
      return new Response(
        JSON.stringify({
          status: "policies_missing",
          message:
            "Admin RLS policies not found. Please run the migration SQL in Supabase Dashboard.",
          instruction:
            "Go to https://supabase.com/dashboard/project/ocivkbocmywinwqmaqac/sql/new and paste the SQL from supabase/migrations/20260527000000_admin_panel_rls.sql",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ status: "ok", policies }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})
