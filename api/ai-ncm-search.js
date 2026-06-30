// Vercel Serverless Function — AI NCM Search
// Replaces missing Supabase Edge Function ai-ncm-search
// Uses Supabase anon key for read-only DB access + DeepSeek API for AI

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

// Helper: query Supabase REST API for NCM tariff data
// Tries exact match first, then prefix match by chapter
async function lookupNcmCodes(ncmCodes) {
  if (!ncmCodes || ncmCodes.length === 0) return {};
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://ocivkbocmywinwqmaqac.supabase.co";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[ai-ncm-search] Supabase env vars not configured');
    return {};
  }
  
  try {
    const result = {};
    
    // Step 1: Try exact match with all 8-digit codes
    const codes8 = [...new Set(ncmCodes.map(c => c.padEnd(8, '0').slice(0, 8)))];
    const filter8 = codes8.map(c => `"${c}"`).join(',');
    const url8 = `${supabaseUrl}/rest/v1/ncms?code=in.(${filter8})&select=code,ii,ipi,pis,cofins,description`;
    
    const resp8 = await fetch(url8, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Accept': 'application/json' }
    });
    
    if (resp8.ok) {
      const rows = await resp8.json();
      for (const row of rows) {
        const code = (row.code || '').replace(/[.\s-]/g, '').padEnd(8, '0');
        result[code] = {
          cadastrado: true, ii: row.ii, ipi: row.ipi, pis: row.pis,
          cofins: 10.45, descricao_ncm_db: row.description || ''
        };
      }
    }
    
    // Step 2: For codes not matched exactly, try chapter prefix (first 4 digits)
    const chapters = [...new Set(codes8
      .filter(c => !result[c.slice(0, 8).padEnd(8, '0')])
      .map(c => c.slice(0, 4))
    )];
    
    for (const chapter of chapters) {
      const url4 = `${supabaseUrl}/rest/v1/ncms?code=like.${chapter}*&select=code,ii,ipi,pis,cofins,description&limit=50`;
      const resp4 = await fetch(url4, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Accept': 'application/json' }
      });
      if (resp4.ok) {
        const rows = await resp4.json();
        for (const row of rows) {
          const code = (row.code || '').replace(/[.\s-]/g, '').padEnd(8, '0');
          if (!result[code]) {
            result[code] = {
              cadastrado: true, ii: row.ii, ipi: row.ipi, pis: row.pis,
              cofins: 10.45, descricao_ncm_db: row.description || ''
            };
          }
        }
      }
    }
    
    return result;
  } catch (err) {
    console.warn('[ai-ncm-search] Supabase lookup error:', err.message);
    return {};
  }
}

// Helper: normalize NCM to 8 digits
function normalizeNcm(code) {
  return String(code || '').replace(/[.\s-]/g, '').padEnd(8, '0').slice(0, 8);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const DEEPSEEK_KEY = process.env.VITE_DEEPSEEK_API_KEY;
    if (!DEEPSEEK_KEY) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
    }

    const body = req.body || {};
    const descricao = (body.descricao || '').trim();
    const explicarNcm = (body.explicar_ncm || '').trim();

    // Mode: explain a single NCM
    if (explicarNcm) {
      const ncmClean = normalizeNcm(explicarNcm);
      
      // Look up in DB
      const dbData = await lookupNcmCodes([ncmClean]);
      const dbEntry = dbData[ncmClean] || {};
      
      const aiRes = await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' },
          messages: [{
            role: 'system',
            content: `Você é um especialista em NCM. Gere explicação didática. Formato JSON: {"explicacao":"texto...","exemplos":["ex1","ex2"],"nao_inclui":"o que não está coberto"}`
          }, {
            role: 'user',
            content: `Explique o código NCM ${ncmClean}`
          }]
        }),
      });

      if (!aiRes.ok) throw new Error(`DeepSeek API error: ${aiRes.status}`);
      const aiData = await aiRes.json();
      const raw = aiData.choices?.[0]?.message?.content;
      let parsed = { explicacao: null, exemplos: [], nao_inclui: null };
      if (raw) {
        try {
          const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {}
      }

      return res.status(200).json({
        ncm: ncmClean,
        descricao_ncm: dbEntry.descricao_ncm_db || '',
        explicacao: parsed.explicacao,
        exemplos: parsed.exemplos || [],
        nao_inclui: parsed.nao_inclui,
        ...dbEntry,
      });
    }

    if (!descricao) {
      return res.status(400).json({ error: 'Descrição não informada' });
    }

    // Main mode: search NCM by description
    const aiRes = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'system',
          content: `Você é especialista em classificação fiscal NCM do Brasil. 
Retorne JSON: {"sugestoes":[{"ncm":"84821010","descricao_ncm":"Rolamentos de esferas","justificativa":"...","confianca":"alta"}]. Máximo 8 sugestões.
Use 8 dígitos. Se não tiver certeza do código exato, indique confianca="media".`
        }, {
          role: 'user',
          content: `Produto: "${descricao}". Sugira os melhores códigos NCM (8 dígitos) para este produto.`
        }]
      }),
    });

    if (!aiRes.ok) throw new Error(`DeepSeek API error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('Empty response from AI');

    let aiResult;
    try {
      const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      aiResult = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response');
    }

    const rawSugestoes = (aiResult?.sugestoes || []).slice(0, 8);
    
    // Extract NCM codes and look them up in the database
    const ncmCodes = rawSugestoes.map(s => normalizeNcm(s.ncm || s.code || ''));
    const dbData = await lookupNcmCodes(ncmCodes);
    
    const sugestoes = rawSugestoes.map((s, i) => {
      const ncm = normalizeNcm(s.ncm || s.code || '');
      const dbEntry = dbData[ncm] || {};
      return {
        ncm,
        descricao_ncm: dbEntry.descricao_ncm_db || s.descricao_ncm || s.descricao || s.description || '',
        justificativa: s.justificativa || '',
        confianca: s.confianca || (i === 0 ? 'alta' : 'media'),
        cadastrado: !!dbEntry.cadastrado,
        ii: dbEntry.ii ?? null,
        ipi: dbEntry.ipi ?? null,
        pis: dbEntry.pis ?? null,
        cofins: dbEntry.cofins ?? null,
      };
    });

    const cadastrados = sugestoes.filter(s => s.cadastrado).length;

    return res.status(200).json({
      sugestoes: sugestoes.slice(0, 8),
      total_sugestoes: sugestoes.length,
      cadastrados_no_banco: cadastrados,
      fonte: 'deepseek-ai',
    });

  } catch (err) {
    console.error('[ai-ncm-search] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
