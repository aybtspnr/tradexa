/**
 * API Proxy — esconde URLs de fontes de dados externas.
 * Todas as chamadas a APIs de terceiros passam por /api/proxy/...
 * Vercel rewrites no vercel.json fazem o roteamento no servidor.
 *
 * Uso:
 *   import { proxyUrl } from "@/services/apiProxy";
 *   const url = proxyUrl("datalastic", "vessel_info?api_key=...");
 *   fetch(url);
 */

const PROXY_BASE = "/api/proxy";

const PROXY_MAP: Record<string, string> = {
  datalastic: "datalastic",
  searates: "searates",
  comexstat: "comexstat",
  worldbank: "worldbank",
  census: "census",
  wto: "wto",
  cnpj: "cnpj",
  receitaws: "receitaws",
  restcountries: "restcountries",
  ibge: "ibge",
  awesomeapi: "awesomeapi",
  bcb: "bcb",
  erapi: "erapi",
  githubGeo: "github-geo",
  supabaseStorage: "supabase-storage",
};

export function proxyUrl(service: string, path: string): string {
  const slug = PROXY_MAP[service];
  if (!slug) {
    console.warn(`[apiProxy] Unknown service: ${service}`);
    return path; // fallback to direct URL
  }
  return `${PROXY_BASE}/${slug}/${path}`;
}

/**
 * Para APIs que usam POST e não podem ser roteadas por Vercel rewrites (ex: Groq).
 * Usa uma Edge Function que faz o proxy.
 */
export async function proxyPost(
  url: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return response;
}
