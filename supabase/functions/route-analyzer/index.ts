import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const UF_MAP: Record<string, string> = {
  "11":"RO","12":"AC","13":"AM","14":"RR","15":"PA","16":"AP","17":"TO",
  "21":"MA","22":"PI","23":"CE","24":"RN","25":"PB","26":"PE","27":"AL","28":"SE","29":"BA",
  "31":"MG","32":"ES","33":"RJ","35":"SP","41":"PR","42":"SC","43":"RS",
  "50":"MS","51":"MT","52":"GO","53":"DF"
}

const URF_NAMES: Record<string, string> = {
  "001":"Porto de Santos","002":"Aeroporto de São Paulo","003":"Porto de Paranaguá",
  "004":"Porto de Rio Grande","005":"Porto de Itajaí","006":"Porto de Vitória",
  "048":"Porto de Suape","099":"Outros","100":"Desembaraço Especial"
}

const PORT_NAMES: Record<string, string> = {
  "NY":"New York","LA":"Los Angeles","HOU":"Houston","MIA":"Miami","SF":"San Francisco",
  "SEA":"Seattle","CHS":"Charleston","ORL":"Orlando","BOS":"Boston","DET":"Detroit"
}

// Demo route data
function generateDemoRoutes(uf: string): any[] {
  const routes = [
    { urf_br: "001", urf_name: "Porto de Santos", port_us: "NY", port_name: "New York", volume_kg: 450000, avg_value: 1250000 },
    { urf_br: "001", urf_name: "Porto de Santos", port_us: "HOU", port_name: "Houston", volume_kg: 210000, avg_value: 580000 },
    { urf_br: "001", urf_name: "Porto de Santos", port_us: "MIA", port_name: "Miami", volume_kg: 180000, avg_value: 420000 },
    { urf_br: "003", urf_name: "Porto de Paranaguá", port_us: "CHS", port_name: "Charleston", volume_kg: 320000, avg_value: 890000 },
    { urf_br: "003", urf_name: "Porto de Paranaguá", port_us: "LA", port_name: "Los Angeles", volume_kg: 150000, avg_value: 380000 },
    { urf_br: "004", urf_name: "Porto de Rio Grande", port_us: "SF", port_name: "San Francisco", volume_kg: 95000, avg_value: 295000 },
    { urf_br: "005", urf_name: "Porto de Itajaí", port_us: "MIA", port_name: "Miami", volume_kg: 75000, avg_value: 210000 },
    { urf_br: "048", urf_name: "Porto de Suape", port_us: "NY", port_name: "New York", volume_kg: 120000, avg_value: 340000 },
  ];
  return routes.map(r => ({
    ...r,
    efficiency_score: Math.round((r.avg_value / (r.volume_kg || 1)) * 100),
    duration_days: Math.floor(Math.random() * 15) + 14,
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { uf, year } = await req.json();
    
    // In future, query COMEXSTAT /general with URF breakdown
    // For now, use demo data
    const routes = generateDemoRoutes(uf || "SP");
    
    routes.sort((a: any, b: any) => b.efficiency_score - a.efficiency_score);

    return new Response(JSON.stringify({
      uf: uf || "SP",
      year: year || "2025",
      routes,
      total_routes: routes.length,
      top_route: routes[0] || null,
      source: 'demo-fallback',
      note: 'Dados de demonstração. Integração COMEXSTAT URF + Census port em desenvolvimento.'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
