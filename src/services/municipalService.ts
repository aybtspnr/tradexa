import { supabase } from "@/integrations/supabase/client";

export interface MunicipalCity {
  co_mun: string;
  mun_nome: string;
  uf: string;
  kg_total: number;
  fob_total: number;
  envios: number;
  top_products: { sh4: string; descricao: string; kg: number; fob: number; envios: number }[];
}

export interface MunicipalDetail {
  co_mun: string;
  mun_nome: string;
  uf: string;
  kg_total: number;
  fob_total: number;
  envios: number;
  products: { sh4: string; descricao: string; kg: number; fob: number; envios: number }[];
  total_products: number;
  uf_rank: number;
  brasil_rank: number;
  top_ncms: string[];
}

export interface CityCompanyGuess {
  nome: string;
  cidade: string;
  uf: string;
  segmento: string;
  porte: string;
  confianca: number;
  produtos: string[];
}

/**
 * Busca ranking municipal usando as Edge Functions Supabase.
 * Período: apenas 2025 (1 ano) para evitar 429 da COMEXSTAT.
 */
export async function fetchMunicipalRanking(
  tipo: "EXP" | "IMP" = "EXP",
  uf?: string,
  limit = 50,
  ano?: string
) {
  const fn = tipo === "EXP" ? "export-data" : "import-data";
  const body: Record<string, any> = { tipo, modo: "dados", ncm: "", uf: uf || "", pais: "", via: "" };
  const targetAno = ano || "2025";
  // Apenas 1 ano para evitar rate limit 429
  body.anoDe = targetAno;
  body.anoAte = targetAno;
  body.mesDe = "01";
  body.mesAte = "12";

  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message || `Erro na edge function ${fn}`);
  if (!data?.registros?.length) {
    return { total: 0, uf_filter: uf || null, cidades: [] as MunicipalCity[] };
  }

  // Agrega municípios de todos os registros
  const cityMap = new Map<string, MunicipalCity>();
  for (const r of data.registros) {
    const municipios = r.municipios || [];
    for (const m of municipios) {
      const key = `${m.mun_nome}|${r.sg_uf}`;
      const existing = cityMap.get(key);
      if (existing) {
        existing.fob_total += m.vl_fob || 0;
        existing.kg_total += m.kg_liquido || 0;
        existing.envios += 1;
      } else {
        cityMap.set(key, {
          co_mun: m.co_mun || "",
          mun_nome: m.mun_nome,
          uf: r.sg_uf || "",
          fob_total: m.vl_fob || 0,
          kg_total: m.kg_liquido || 0,
          envios: 1,
          top_products: [],
        });
      }
    }
  }

  let cidades = Array.from(cityMap.values())
    .sort((a, b) => b.fob_total - a.fob_total)
    .slice(0, limit);

  if (uf) {
    cidades = cidades.filter(c => c.uf === uf);
  }

  return { total: cidades.length, uf_filter: uf || null, cidades };
}

/**
 * Busca detalhes de uma cidade.
 * Período: apenas 2025.
 */
export async function fetchMunicipalDetail(
  tipo: "EXP" | "IMP" = "EXP",
  mun_nome: string,
  uf: string,
  ano?: string
) {
  const fn = tipo === "EXP" ? "export-data" : "import-data";
  const body: Record<string, any> = { tipo, modo: "dados", ncm: "", uf, pais: "", via: "" };
  const targetAno = ano || "2025";
  body.anoDe = targetAno;
  body.anoAte = targetAno;
  body.mesDe = "01";
  body.mesAte = "12";

  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message || `Erro na edge function ${fn}`);
  if (!data?.registros?.length) {
    return {
      co_mun: "",
      mun_nome,
      uf,
      kg_total: 0,
      fob_total: 0,
      envios: 0,
      products: [],
      total_products: 0,
      uf_rank: 0,
      brasil_rank: 0,
    } as MunicipalDetail;
  }

  let kg_total = 0;
  let fob_total = 0;
  let envios = 0;
  const products: Record<string, { sh4: string; descricao: string; kg: number; fob: number; envios: number }> = {};

  for (const r of data.registros) {
    const municipios = r.municipios || [];
    for (const m of municipios) {
      const match = m.mun_nome.toLowerCase().includes(mun_nome.toLowerCase()) ||
                    mun_nome.toLowerCase().includes(m.mun_nome.toLowerCase());
      if (!match) continue;

      kg_total += m.kg_liquido || 0;
      fob_total += m.vl_fob || 0;
      envios += 1;

      const sh4 = "geral";
      if (!products[sh4]) {
        products[sh4] = { sh4, descricao: "Produtos diversos", kg: 0, fob: 0, envios: 0 };
      }
      products[sh4].kg += m.kg_liquido || 0;
      products[sh4].fob += m.vl_fob || 0;
      products[sh4].envios += 1;
    }
  }

  const productList = Object.values(products).sort((a, b) => b.fob - a.fob);

  return {
    co_mun: "",
    mun_nome,
    uf,
    kg_total,
    fob_total,
    envios,
    products: productList,
    total_products: productList.length,
    uf_rank: 1,
    brasil_rank: 1,
  } as MunicipalDetail;
}

/**
 * IA adivinha empresas prováveis.
 * Período: apenas 2025.
 */
export async function guessCompaniesForCity(
  tipo: "EXP" | "IMP" = "EXP",
  mun_nome: string,
  uf: string,
  ncm?: string,
  ano?: string
): Promise<{ empresas: CityCompanyGuess[]; cidades: any[]; ufs: string[]; paises: string[] }> {
  const fn = tipo === "EXP" ? "export-data" : "import-data";
  const targetAno = ano || "2025";
  const body: Record<string, any> = {
    tipo,
    modo: "buscar_cnpjs",
    ncm: ncm || "8482",
    uf,
    pais: "",
    via: "",
    anoDe: targetAno,
    anoAte: targetAno,
    mesDe: "01",
    mesAte: "12",
  };

  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message || `Erro na edge function ${fn}`);
  if (!data?.empresas?.length) {
    return { empresas: [], cidades: [], ufs: [], paises: [] };
  }

  const cityLower = mun_nome.toLowerCase();
  const empresas: CityCompanyGuess[] = data.empresas
    .filter((e: any) => e.cidade?.toLowerCase().includes(cityLower) || cityLower.includes(e.cidade?.toLowerCase()))
    .map((e: any) => ({
      nome: e.nome,
      cidade: e.cidade,
      uf: e.cidade?.split("-")?.[1]?.trim() || uf,
      segmento: e.segmento || "Não informado",
      porte: e.porte || "médio",
      confianca: e.fonte ? 0.85 : 0.6,
      produtos: [],
    }));

  return {
    empresas,
    cidades: data.cidades || [],
    ufs: data.ufs || [],
    paises: data.paises || [],
  };
}
