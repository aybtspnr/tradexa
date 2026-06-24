import { groqChat } from './groq';

export interface EstimatedCompany {
  nome: string;
  cidade: string;
  uf: string;
  cnae_primario?: string;
  descricao_cnae?: string;
  porte: 'Pequeno' | 'Médio' | 'Grande';
  confianca: number;
  fonte: string;
  volume_estimado: string;
}

function sanitizeJson(raw: string): string {
  return raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/^\s*\n/, '')
    .trim();
}

export async function estimateCompanies(
  municipio: string,
  uf: string,
  ncm: string,
  descricaoNcm: string = '',
  volumeFob: number = 0,
  tipo: 'export' | 'import' = 'export'
): Promise<EstimatedCompany[]> {
  const tipoTexto = tipo === 'export' ? 'exportadora' : 'importadora';

  const resp = await groqChat(
    [
      {
        role: 'system',
        content: `Você é um banco de dados comercial brasileiro. Com base no código NCM e no município/UF, liste empresas REAIS do Brasil que provavelmente são ${tipoTexto}s desse produto.

IMPORTANTE: Siga ESTRITAMENTE estas regras:
1. Liste APENAS empresas que REALMENTE existem ou existiram no Brasil
2. NUNCA invente nomes — se não tiver certeza, deixe a lista vazia
3. Use conhecimento sobre polos industriais brasileiros
4. Se o CEP/município for de uma região específica com forte tradição no segmento, mencione as principais empresas

Responda SEMPRE em JSON válido seguindo este formato exato:
{
  "empresas": [
    {
      "nome": "Nome Fantasia ou Razão Social",
      "cidade": "Nome da Cidade",
      "uf": "XX",
      "cnae_primario": "XXXX-0/00",
      "descricao_cnae": "Descrição da atividade",
      "porte": "Pequeno|Médio|Grande",
      "confianca": 1-100,
      "fonte": "Razão para a sugestão (ex: polo de Sorocaba/SP, maior empresa do setor em SC)",
      "volume_estimado": "descrição textual do volume"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Município: ${municipio} - ${uf}
NCM: ${ncm}${descricaoNcm ? ` - ${descricaoNcm}` : ''}
Volume ${tipo === 'export' ? 'FOB' : 'CIF'} total no período: US$ ${volumeFob.toLocaleString('pt-BR')}
Operação: ${tipo === 'export' ? 'EXPORTAÇÃO' : 'IMPORTAÇÃO'}

Liste 5-8 empresas brasileiras REAIS que provavelmente realizam essa operação nesse município/UF.`,
      },
    ],
    {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }
  );

  try {
    const parsed = JSON.parse(sanitizeJson(resp));
    if (Array.isArray(parsed.empresas)) {
      return parsed.empresas.map((e: any) => ({
        nome: String(e.nome || ''),
        cidade: String(e.cidade || municipio),
        uf: String(e.uf || uf),
        cnae_primario: e.cnae_primario,
        descricao_cnae: e.descricao_cnae,
        porte: ['Pequeno', 'Médio', 'Grande'].includes(e.porte) ? e.porte : 'Médio',
        confianca: Math.min(100, Math.max(0, Number(e.confianca) || 50)),
        fonte: String(e.fonte || 'Sugestão baseada em NCM + localização'),
        volume_estimado: String(e.volume_estimado || 'Não estimado'),
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/** Agrupa dados COMEXSTAT por município e retorna top N municipios por FOB */
export function groupByMunicipio(registros: any[]): { mun_nome: string; uf: string; total_fob: number; total_kg: number; ncm: string }[] {
  const map = new Map<string, { mun_nome: string; uf: string; total_fob: number; total_kg: number; ncm: string }>();
  for (const r of registros) {
    for (const m of r.municipios || []) {
      const parts = (m.mun_nome || '').split(' - ');
      const city = parts[0] || m.mun_nome || '';
      const uf = parts[1] || r.sg_uf || '';
      const key = `${city}|${uf}`;
      const existing = map.get(key);
      const fob = Number(m.vl_fob || 0);
      const kg = Number(m.kg_liquido || 0);
      if (existing) {
        existing.total_fob += fob;
        existing.total_kg += kg;
      } else {
        map.set(key, { mun_nome: city, uf, total_fob: fob, total_kg: kg, ncm: r.co_ncm || '' });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.total_fob - a.total_fob)
    .filter((m) => m.mun_nome && m.mun_nome !== 'Não informado');
}
