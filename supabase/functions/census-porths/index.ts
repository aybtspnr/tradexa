// Census Port Trade Data (porths)
// US imports/exports by port — no auth needed, Census key embedded
const CENSUS_KEY = Deno.env.get("CENSUS_API_KEY") || "1bd2f7004fe5fe577570bda949c4dd22a2466e5d";
const BASE = "https://api.census.gov/data/timeseries/intltrade";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

async function fetchPortData(flow: "imports" | "exports", portCode: string, year: string) {
  const endpoint = `${BASE}/${flow}/porths`;
  const params = new URLSearchParams({
    get: "PORT,PORT_NAME,GEN_VAL_MO",
    PORT: portCode,
    time: `${year}-01`,
    key: CENSUS_KEY,
  });
  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Census ${flow} porths error: ${res.status}`);
  const data = await res.json();
  return data;
}

async function fetchTopPorts(flow: "imports" | "exports", year: string, limit: number) {
  const endpoint = `${BASE}/${flow}/porths`;
  const params = new URLSearchParams({
    get: "PORT,PORT_NAME,GEN_VAL_MO",
    time: `${year}-01`,
    key: CENSUS_KEY,
  });
  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Census ${flow} porths error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length < 2) return [];
  const headers = data[0];
  const valIdx = headers.indexOf("GEN_VAL_MO");
  const nameIdx = headers.indexOf("PORT_NAME");
  const codeIdx = headers.indexOf("PORT");
  const rows = data.slice(1)
    .map((r: any) => ({
      port_code: r[codeIdx],
      port_name: r[nameIdx],
      value_mo: parseInt(r[valIdx] || "0", 10),
      year,
    }))
    .filter((r: any) => r.value_mo > 0)
    .sort((a: any, b: any) => b.value_mo - a.value_mo)
    .slice(0, limit);
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });
  try {
    let action = "top";
    let flow: "imports" | "exports" = "imports";
    let year = "2025";
    let port = "";
    let limit = 20;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      action = body.action || action;
      flow = body.flow || flow;
      year = body.year || year;
      port = body.port || port;
      limit = body.limit || limit;
    } else {
      const { searchParams } = new URL(req.url);
      action = searchParams.get("action") || action;
      flow = (searchParams.get("flow") || flow) as "imports" | "exports";
      year = searchParams.get("year") || year;
      port = searchParams.get("port") || port;
      limit = parseInt(searchParams.get("limit") || "20", 10);
    }

    if (action === "port") {
      const data = await fetchPortData(flow, port, year);
      return new Response(JSON.stringify({ action: "port", flow, port, year, data }), {
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const data = await fetchTopPorts(flow, year, limit);
    return new Response(JSON.stringify({ action: "top", flow, year, limit, ports: data }), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }
});
