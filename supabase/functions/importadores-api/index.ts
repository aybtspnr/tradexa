// Supabase Edge Function: Proxy for Importadores API
// Solves Mixed Content: HTTPS frontend → HTTPS edge function → HTTP VPS

const VPS_API = "http://129.121.98.20:5057/api/intel/importadores";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let apiPath = "/index";

    if (req.method === "POST") {
      // Frontend sends: { path: "/index" } or { path: "/chapter/09?page=1" }
      const body = await req.json().catch(() => ({}));
      if (body.path) apiPath = body.path;
    } else {
      // GET fallback: extract from URL
      const url = new URL(req.url);
      const parts = url.pathname.split("/importadores-api");
      apiPath = parts.length > 1 ? parts[1] : "/index";
      // Also append query string if present
      if (url.search) apiPath += url.search;
    }

    const targetUrl = `${VPS_API}${apiPath}`;
    console.log(`Proxy: ${req.method} → ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`VPS returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao buscar dados" }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});