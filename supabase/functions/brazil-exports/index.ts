// supabase/functions/brazil-exports/index.ts
// Dados de exportação do Brasil por país parceiro (COMTRADE UN Preview API)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// UN Comtrade country codes → names
const COUNTRY_MAP: Record<number, string> = {
  0: "Mundo", 4: "Afeganistão", 8: "Albânia", 12: "Argélia", 20: "Andorra",
  24: "Angola", 28: "Antígua e Barbuda", 31: "Azerbaijão", 32: "Argentina",
  36: "Austrália", 40: "Áustria", 44: "Bahamas", 48: "Bahrein", 50: "Bangladesh",
  51: "Armênia", 52: "Barbados", 56: "Bélgica", 64: "Butão", 68: "Bolívia",
  70: "Bósnia-Herzegovina", 72: "Botsuana", 76: "Brasil", 84: "Belize",
  90: "Ilhas Salomão", 96: "Brunei", 100: "Bulgária", 104: "Myanmar",
  108: "Burundi", 112: "Belarus", 116: "Camboja", 120: "Camarões", 124: "Canadá",
  132: "Cabo Verde", 140: "Rep. Centro-Africana", 144: "Sri Lanka", 148: "Chade",
  152: "Chile", 156: "China", 158: "Taiwan", 170: "Colômbia", 174: "Comores",
  178: "Congo", 180: "RD Congo", 188: "Costa Rica", 191: "Croácia", 192: "Cuba",
  196: "Chipre", 203: "Rep. Tcheca", 204: "Benin", 208: "Dinamarca", 212: "Dominica",
  214: "Rep. Dominicana", 218: "Equador", 222: "El Salvador", 226: "Guiné Equatorial",
  231: "Etiópia", 232: "Eritreia", 233: "Estônia", 234: "Ilhas Faroe",
  242: "Fiji", 246: "Finlândia", 250: "França", 262: "Djibuti", 266: "Gabão",
  268: "Geórgia", 270: "Gâmbia", 275: "Palestina", 276: "Alemanha", 288: "Gana",
  292: "Gibraltar", 300: "Grécia", 304: "Groenlândia", 308: "Granada",
  320: "Guatemala", 324: "Guiné", 328: "Guiana", 332: "Haiti", 336: "Vaticano",
  340: "Honduras", 344: "Hong Kong", 348: "Hungria", 352: "Islândia", 356: "Índia",
  360: "Indonésia", 364: "Irã", 368: "Iraque", 372: "Irlanda", 376: "Israel",
  380: "Itália", 384: "Costa do Marfim", 388: "Jamaica", 392: "Japão",
  398: "Cazaquistão", 400: "Jordânia", 404: "Quênia", 408: "Coreia do Norte",
  410: "Coreia do Sul", 414: "Kuwait", 417: "Quirguistão", 418: "Laos",
  422: "Líbano", 426: "Lesoto", 428: "Letônia", 430: "Libéria", 434: "Líbia",
  438: "Liechtenstein", 440: "Lituânia", 442: "Luxemburgo", 446: "Macau",
  450: "Madagascar", 454: "Malawi", 458: "Malásia", 462: "Maldivas", 466: "Mali",
  470: "Malta", 474: "Martinica", 478: "Mauritânia", 480: "Maurício", 484: "México",
  492: "Mônaco", 496: "Mongólia", 498: "Moldávia", 499: "Montenegro",
  504: "Marrocos", 508: "Moçambique", 512: "Omã", 516: "Namíbia", 524: "Nepal",
  528: "Países Baixos", 531: "Curaçao", 533: "Aruba", 548: "Vanuatu",
  554: "Nova Zelândia", 558: "Nicarágua", 562: "Níger", 566: "Nigéria",
  578: "Noruega", 583: "Micronésia", 584: "Ilhas Marshall", 586: "Paquistão",
  591: "Panamá", 598: "Papua-Nova Guiné", 600: "Paraguai", 604: "Peru",
  608: "Filipinas", 616: "Polônia", 620: "Portugal", 624: "Guiné-Bissau",
  626: "Timor-Leste", 630: "Porto Rico", 634: "Catar", 642: "Romênia",
  643: "Rússia", 646: "Ruanda", 662: "Santa Lúcia", 678: "São Tomé e Príncipe",
  682: "Arábia Saudita", 686: "Senegal", 688: "Sérvia", 690: "Seychelles",
  694: "Serra Leoa", 699: "Índia", 702: "Singapura", 703: "Eslováquia",
  704: "Vietnã", 705: "Eslovênia", 706: "Somália", 710: "África do Sul",
  716: "Zimbábue", 724: "Espanha", 728: "Sudão do Sul", 729: "Sudão",
  740: "Suriname", 748: "Essuatíni", 752: "Suécia", 756: "Suíça", 760: "Síria",
  762: "Tadjiquistão", 764: "Tailândia", 768: "Togo", 776: "Tonga",
  780: "Trinidad e Tobago", 784: "Emirados Árabes", 788: "Tunísia", 792: "Turquia",
  795: "Turcomenistão", 800: "Uganda", 804: "Ucrânia", 807: "Macedônia do Norte",
  818: "Egito", 826: "Reino Unido", 834: "Tanzânia", 840: "Estados Unidos",
  842: "EUA", 854: "Burkina Faso", 858: "Uruguai", 860: "Uzbequistão",
  862: "Venezuela", 882: "Samoa", 887: "Iêmen", 894: "Zâmbia",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch { /* defaults */ }
    const year = body.year || "2024";

    // Fetch Brazil exports (reporterCode=76, flowCode=X=exports)
    const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=076&period=${year}&cmdCode=TOTAL&flowCode=X`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`COMTRADE HTTP ${res.status}`);

    const data = await res.json();
    const records: any[] = data?.data || [];

    // Aggregate by partner
    const partnerMap: Record<number, number> = {};
    for (const r of records) {
      const code = r.partnerCode;
      const val = r.fobvalue || r.primaryValue || 0;
      partnerMap[code] = (partnerMap[code] || 0) + val;
    }

    // Build sorted list with names
    const sorted = Object.entries(partnerMap)
      .map(([code, value]) => ({
        partner_code: parseInt(code),
        partner_name: COUNTRY_MAP[parseInt(code)] || `Código ${code}`,
        value_usd: value,
      }))
      .filter(r => r.partner_code !== 0 && r.partner_code !== 76) // Remove "Mundo" e Brasil
      .sort((a, b) => b.value_usd - a.value_usd);

    const total = sorted.reduce((s, r) => s + r.value_usd, 0);

    return new Response(JSON.stringify({
      records: sorted,
      total_value: total,
      total_partners: sorted.length,
      year,
      source: "un-comtrade",
      hint: "Dados oficiais UN COMTRADE — exportações brasileiras por país de destino (FOB).",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("[brazil-exports] ERROR:", error.message);
    return new Response(JSON.stringify({
      error: error.message,
      records: [],
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
