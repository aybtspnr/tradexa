const AI_API_KEY = ''; // Chave agora fica no backend (Supabase Edge Function)
const AI_API_URL = '/api/deepseek-proxy';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
  systemPrompt?: string;
}

const DEFAULT_OPTIONS: GroqOptions = {
  model: 'deepseek-chat',
  temperature: 0.3,
  max_tokens: 1024,
};

export async function groqChat(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Helper rápido para análise de dados de exportação
export async function analyzeExportData(
  registros: any[],
  question: string
): Promise<string> {
  const summary = {
    total_registros: registros.length,
    total_fob: registros.reduce((s, r) => s + (r.vl_fob || 0), 0),
    total_kg: registros.reduce((s, r) => s + (r.kg_liquido || 0), 0),
    paises: [...new Set(registros.map(r => r.pais_nome))].slice(0, 20),
    ufs: [...new Set(registros.map(r => r.sg_uf).filter(Boolean))].slice(0, 10),
    vias: [...new Set(registros.map(r => r.via_nome))],
  };

  return groqChat([
    {
      role: 'system',
      content: `Você é um analista de comércio exterior brasileiro, especialista em dados COMEXSTAT/MDIC. Responda em português com Markdown e emojis. Valores em USD.`
    },
    {
      role: 'user',
      content: `Dados de exportação:\n${JSON.stringify(summary, null, 2)}\n\nPergunta: ${question}\n\nForneça análise detalhada.`
    }
  ]);
}

// Helper para tradução/descrição de produtos
export async function describeProduct(description: string): Promise<{ncm: string, descricao: string, confianca: string}[]> {
  const content = await groqChat([
    {
      role: 'system',
      content: `Especialista NCM brasileiro. Retorne JSON com array "sugestoes": [{"ncm":"84821010","descricao":"...","confianca":"alta"}]. Máx 3.`
    },
    {
      role: 'user',
      content: `Produto: "${description}"`
    }
  ], { response_format: { type: 'json_object' } });

  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsed.sugestoes || parsed.suggestions || [];
  } catch {
    return [];
  }
}

// Helper para classificação de oportunidades
export async function detectOpportunities(
  ncmData: any[],
  competitorData?: any[]
): Promise<{tipo: string, titulo: string, descricao: string, score: number}[]> {
  const content = await groqChat([
    {
      role: 'system',
      content: `Analista de mercado de exportação. Detecte oportunidades a partir dos dados. Retorne JSON: {"oportunidades": [{"tipo":"novo_mercado","titulo":"...","descricao":"...","score":85}].}`
    },
    {
      role: 'user',
      content: `Dados NCM:\n${JSON.stringify(ncmData.slice(0, 50), null, 2)}\n${competitorData ? `\nDados concorrentes:\n${JSON.stringify(competitorData.slice(0, 20), null, 2)}` : ''}\n\nDetecte oportunidades.`
    }
  ], { response_format: { type: 'json_object' } });

  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsed.oportunidades || parsed.opportunities || [];
  } catch {
    return [];
  }
}