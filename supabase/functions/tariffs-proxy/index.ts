// supabase/functions/tariffs-proxy/index.ts
// Proxy HTTPS → VPS HTTP para evitar Mixed Content no Vercel
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VPS_BASE = "http://129.121.98.20:5051/api/tariffs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Repassa todos os query params para o VPS
    const vpsUrl = `${VPS_BASE}?${url.searchParams.toString()}`;

    const res = await fetch(vpsUrl, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Proxy error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
