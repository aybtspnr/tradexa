import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Paginação: Supabase retorna max 1000 por query
async function fetchAllNcms(supabase: any): Promise<any[]> {
  const all: any[] = []
  let offset = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabase
      .from("ncms")
      .select("code, description, ii, ipi, pis, cofins")
      .order("code", { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(`Erro paginação: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < pageSize) break
    offset += pageSize
  }
  return all
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_API_KEY") || ''
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!DEEPSEEK_KEY) {
      return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY não configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    let body: any = {}
    try { body = await req.json() } catch {
      const url = new URL(req.url)
      body = { descricao: url.searchParams.get('descricao') || '' }
    }

    const descricao = (body?.descricao || body?.search || '').trim()
    const explicarNcm = (body?.explicar_ncm || '').trim()

    // Inicializar Supabase (precisa estar antes de qualquer uso)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Modo: explicar um único NCM
    if (explicarNcm) {
      // Buscar dados do NCM na base
      const ncmClean = explicarNcm.replace(/\D/g, '')
      const { data: ncmData } = await supabase
        .from("ncms")
        .select("code, description, ii, ipi, pis, cofins")
        .ilike("code", `${ncmClean}%`)
        .limit(1)
      
      const ncmInfo = ncmData?.[0]
      if (!ncmInfo) {
        return new Response(JSON.stringify({ error: "NCM não encontrado na base" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: "json_object" },
          messages: [{
            role: "system",
            content: `Você é um especialista em NCM que explica códigos fiscais para importadores/exportadores brasileiros.

Gere uma explicação DIDÁTICA de 3-4 frases (máx 300 caracteres) respondendo:
- O que este código cobre (produtos incluídos)
- O que NÃO está incluído (produtos que vão em outro código)
- Dica prática para o cliente decidir se é o código certo

Formato JSON: {"explicacao": "texto da explicação...", "exemplos": ["exemplo 1", "exemplo 2"], "nao_inclui": "o que não está coberto"}`
          }, {
            role: "user",
            content: `Explique o código NCM ${ncmInfo.code}: ${ncmInfo.description}`
          }]
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!aiResponse.ok) {
        const errText = await aiResponse.text()
        throw new Error(`DeepSeek API error: ${aiResponse.status}`)
      }

      const aiData = await aiResponse.json()
      const raw = aiData.choices?.[0]?.message?.content
      let explicacao = null
      let exemplos: string[] = []
      let naoInclui = null

      if (raw) {
        try {
          const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim()
          const match = cleaned.match(/\{[\s\S]*\}/)
          const parsed = match ? JSON.parse(match[0]) : null
          if (parsed) {
            explicacao = parsed.explicacao || null
            exemplos = parsed.exemplos || []
            naoInclui = parsed.nao_inclui || null
          }
        } catch (_) {}
      }

      return new Response(JSON.stringify({
        ncm: ncmInfo.code,
        descricao_ncm: ncmInfo.description,
        explicacao,
        exemplos,
        nao_inclui: naoInclui,
        ii: ncmInfo.ii ?? null,
        ipi: ncmInfo.ipi ?? null,
        pis: ncmInfo.pis ?? null,
        cofins: ncmInfo.cofins ?? null,
        cadastrado: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    if (!descricao) {
      return new Response(JSON.stringify({ error: "Descrição não informada" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // ═══ ETAPA 1: Buscar TODOS os NCMs (com paginação) ═══
    const allNcms = await fetchAllNcms(supabase)

    if (allNcms.length === 0) {
      throw new Error("Base NCM vazia. Importe NCMs primeiro em Admin > Base NCM.")
    }

    // Agrupar por heading (4 dígitos) com descrição + contagem
    const headingMap = new Map<string, { desc: string; count: number; hasTaxes: boolean }>()
    for (const ncm of allNcms) {
      const code = String(ncm.code).replace(/\D/g, '')
      const heading = code.substring(0, 4)
      if (!headingMap.has(heading)) {
        const taxes = (ncm.ii && ncm.ii > 0) || (ncm.ipi && ncm.ipi > 0)
        headingMap.set(heading, { desc: ncm.description, count: 1, hasTaxes: taxes })
      } else {
        const h = headingMap.get(heading)!
        h.count++
        if ((ncm.ii && ncm.ii > 0) || (ncm.ipi && ncm.ipi > 0)) h.hasTaxes = true
      }
    }

    const headingList = Array.from(headingMap.entries())
      .map(([h, info]) => `${h}: ${info.desc.substring(0, 80)} (${info.count} NCMs${info.hasTaxes ? ', com aliquotas' : ''})`)
      .join('\n')

    const safeDescricao = descricao.replace(/["\\]/g, "'").substring(0, 400)

    // Extrair material mencionado para forçar prioridade
    const materialMap: Record<string, string> = {
      'algodao': 'algodão', 'algodón': 'algodão', 'cotton': 'algodão',
      'sintetic': 'fibra sintética', 'sintética': 'fibra sintética', 'poliester': 'poliéster',
      'poliéster': 'poliéster', 'polyester': 'poliéster', 'poliamida': 'poliamida',
      'couro': 'couro', 'leather': 'couro', 'plastico': 'plástico', 'plástico': 'plástico',
      'metal': 'metal', 'ferro': 'ferro', 'aço': 'aço', 'aco': 'aço',
      'madeira': 'madeira', 'wood': 'madeira', 'vidro': 'vidro', 'glass': 'vidro',
      'borracha': 'borracha', 'rubber': 'borracha',
    }
    const descLower = descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let materialInstrucao = ''
    for (const [key, label] of Object.entries(materialMap)) {
      if (descLower.includes(key)) {
        materialInstrucao = `\n⚠️ MATERIAL DETECTADO: ${label}. Este deve ser o CRITÉRIO PRINCIPAL. NCMs de ${label} DEVEM vir ANTES de qualquer outro material.`
        break
      }
    }

    // ═══ ETAPA 2: IA sugere os melhores headings ═══
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [{
          role: "system",
          content: `Você é especialista em classificação fiscal NCM do Brasil.

TAREFA: Para o produto descrito, identifique os HEADINGS NCM (4 dígitos) mais relevantes da lista abaixo.

CRITÉRIO PRINCIPAL: COMPOSIÇÃO DO MATERIAL é o fator determinante:
- Algodão → Cap 61 (malha) ou 62 (tecido plano)
- Poliéster/sintético → Cap 61 ou 62, subposições diferentes
- Plástico → Cap 39
- Metal/ferro → Cap 72-73
- Madeira → Cap 44
- Couro → Cap 41-42

Use APENAS headings da lista fornecida. Se o heading ideal NÃO está na lista, sugira os capítulos (2 dígitos) mais próximos como alternativa.

Retorne de 3 a 8 sugestões. Inclua headings EXISTENTES na lista e, se não houver match exato, inclua alternativas próximas com confianca="baixa".

Formato JSON:
{
  "sugestoes": [
    {
      "heading": "6106",
      "descricao": "Blusas femininas de algodão, de malha",
      "confianca": "alta",
      "justificativa": "Material algodão, vestuário feminino, malha → Cap 61 heading 06"
    }
  ]
}`
        }, {
          role: "user",
          content: `Produto: "${safeDescricao}"${materialInstrucao}

TODOS OS HEADINGS DISPONIVEIS NA BASE (${headingMap.size} headings, ${allNcms.length} NCMs):
${headingList}

ORDENE por relevancia. O MATERIAL do produto e o criterio MAIS IMPORTANTE para a ordem.
Se o heading exato nao existir, sugira alternativas.`
        }]
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      throw new Error(`DeepSeek API error: ${aiResponse.status} — ${errText.substring(0, 200)}`)
    }

    const aiData = await aiResponse.json()
    const rawContent = aiData.choices?.[0]?.message?.content
    if (!rawContent) throw new Error("Conteúdo vazio da IA")

    let aiResult: any
    try {
      let cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim()
      const objectMatch = cleaned.match(/\{[\s\S]*\}/)
      aiResult = objectMatch ? JSON.parse(objectMatch[0]) : JSON.parse(cleaned)
    } catch {
      throw new Error("Não foi possível extrair JSON da resposta da IA")
    }

    const sugestoes = (aiResult?.sugestoes || []).filter((s: any) => s.heading)

    if (sugestoes.length === 0) {
      throw new Error("A IA não retornou sugestões. Tente descrever o produto com mais detalhes (material, uso).")
    }

    // ═══ ETAPA 3: Buscar NCMs completos para cada heading sugerido ═══
    const resultado: any[] = []
    const addedCodes = new Set<string>()

    // Identificar material para boost na ordenação
    const materialKeywords = materialInstrucao ? descLower.split(/\s+/).filter((w: string) => w.length > 3) : []

    // Criar índice de NCMs por heading
    const ncmsByHeading = new Map<string, any[]>()
    for (const ncm of allNcms) {
      const code = String(ncm.code).replace(/\D/g, '')
      const heading = code.substring(0, 4)
      if (!ncmsByHeading.has(heading)) ncmsByHeading.set(heading, [])
      ncmsByHeading.get(heading)!.push(ncm)
    }

    for (const sug of sugestoes) {
      const headingClean = String(sug.heading).replace(/\D/g, '').substring(0, 4)
      const ncms = ncmsByHeading.get(headingClean) || []

      // Ordenar: material match > 8 dígitos com alíquotas > 8 dígitos sem > menos dígitos
      ncms.sort((a, b) => {
        const descA = String(a.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const descB = String(b.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        // Boost: descrição contém o material mencionado
        const aMat = materialKeywords.some((kw: string) => descA.includes(kw)) ? 1 : 0
        const bMat = materialKeywords.some((kw: string) => descB.includes(kw)) ? 1 : 0
        if (aMat !== bMat) return bMat - aMat

        const aDig = String(a.code).replace(/\D/g, '').length
        const bDig = String(b.code).replace(/\D/g, '').length
        const aTax = (a.ii && a.ii > 0) || (a.ipi && a.ipi > 0) ? 1 : 0
        const bTax = (b.ii && b.ii > 0) || (b.ipi && b.ipi > 0) ? 1 : 0
        if (aDig >= 8 && bDig < 8) return -1
        if (bDig >= 8 && aDig < 8) return 1
        if (aTax !== bTax) return bTax - aTax
        return bDig - aDig
      })

      for (const ncm of ncms.slice(0, 5)) {
        if (addedCodes.has(ncm.code)) continue
        addedCodes.add(ncm.code)
        const codeDigits = String(ncm.code).replace(/\D/g, '').length
        resultado.push({
          ncm: ncm.code,
          descricao_ncm: ncm.description,
          justificativa: sug.justificativa || `Heading ${headingClean} — ${sug.descricao || ''}`,
          confianca: codeDigits >= 8 ? (sug.confianca || "alta") : "media",
          cadastrado: true,
          heading: headingClean,
          digitos: codeDigits,
          ii: ncm.ii ?? null,
          ipi: ncm.ipi ?? null,
          pis: ncm.pis ?? null,
          cofins: ncm.cofins ?? null,
        })
      }
    }

    return new Response(JSON.stringify({
      sugestoes: resultado.slice(0, 12),
      total_sugestoes: resultado.length,
      cadastrados_no_banco: resultado.length,
      headings_sugeridos: sugestoes.map((s: any) => s.heading),
      total_ncms_na_base: allNcms.length,
      total_headings_na_base: headingMap.size,
      fonte: 'deepseek-heading-db-lookup',
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (err: any) {
    console.error("[ai-ncm-search] ERROR:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
