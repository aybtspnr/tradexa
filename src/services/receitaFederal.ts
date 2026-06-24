// Receita Federal CNPJ API — dados públicos de empresas brasileiras
// Fonte: receitaws.com.br (gratuito, 3 req/min)

import { proxyUrl } from './apiProxy';

export interface ReceitaFederalData {
  cnpj: string;
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  atividade_principal: { code: string; text: string }[];
  atividades_secundarias: { code: string; text: string }[];
  situacao: string;
  abertura: string;
  natureza_juridica: string;
  capital_social: string;
  qsa: { nome: string; qual: string }[];
}

export async function fetchReceitaFederal(cnpj: string): Promise<ReceitaFederalData | null> {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) {
    console.warn("CNPJ inválido:", cnpj);
    return null;
  }

  try {
    const res = await fetch(proxyUrl("receitaws", `v1/cnpj/${clean}`), {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.warn("Receita Federal API: rate limit (3 req/min)");
      }
      return null;
    }

    const data = await res.json();
    if (data.status === "ERROR") return null;

    return data as ReceitaFederalData;
  } catch (e) {
    console.error("Erro ao buscar CNPJ na Receita Federal:", e);
    return null;
  }
}

export function formatCnpj(cnpj: string): string {
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14) return cnpj;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}
