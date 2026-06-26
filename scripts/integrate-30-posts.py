#!/usr/bin/env python3
"""Integration script for 30 new blog posts — updates postMeta.ts, postContentMap.ts, prerender.mjs"""

NEW_POSTS = [
    {
        "slug": "exportacao-servicos-engenharia-projetos-internacionais",
        "title": "Exportacao de Servicos de Engenharia: Guia para Projetos Internacionais",
        "excerpt": "Guia completo sobre exportacao de servicos de engenharia brasileiros: modelos de operacao internacional, tributacao, contratos FIDIC, financiamento e gestao de riscos.",
        "readTime": 21,
        "tags": ["Servicos", "Engenharia", "Exportacao", "Projetos Internacionais", "Comercio Exterior"]
    },
    {
        "slug": "servicos-digitais-importacao-classificacao-tributacao",
        "title": "Importacao de Servicos Digitais: Classificacao NCM e Tributacao",
        "excerpt": "Guia completo sobre importacao de servicos digitais: classificacao NCM/NBS, tributacao IRRF/CIDE, obrigacoes Siscoserv e planejamento tributario internacional.",
        "readTime": 19,
        "tags": ["Servicos Digitais", "Importacao", "NCM", "Tributacao", "Comercio Exterior"]
    },
    {
        "slug": "outsourcing-terceirizacao-servicos-comex-brasil",
        "title": "Outsourcing e BPO no Comercio Exterior: Como Terceirizar com Seguranca",
        "excerpt": "Guia completo sobre outsourcing e BPO no comercio exterior: como terceirizar processos de importacao e exportacao com seguranca juridica e reducao de custos.",
        "readTime": 15,
        "tags": ["Outsourcing", "BPO", "Terceirizacao", "Gestao", "Comercio Exterior"]
    },
    {
        "slug": "gestao-cadeia-fornecedores-internacional-estrategica",
        "title": "Gestao Estrategica da Cadeia de Fornecedores Internacionais",
        "excerpt": "Guia completo sobre gestao estrategica de fornecedores internacionais: selecao, avaliacao, riscos, negociacao e tecnologia aplicada a supply chain global.",
        "readTime": 16,
        "tags": ["Fornecedores", "Supply Chain", "Gestao", "Estrategia", "Comercio Exterior"]
    },
    {
        "slug": "holding-internacional-planejamento-tributario-comex",
        "title": "Holding Internacional no Comex: Planejamento Tributario e Estrutura Societaria",
        "excerpt": "Guia completo sobre holding internacional para comercio exterior: planejamento tributario, jurisdicoes, tratados, transfer pricing e estruturacao societaria.",
        "readTime": 15,
        "tags": ["Holding", "Tributacao", "Planejamento Tributario", "Estrutura Societaria", "Comercio Exterior"]
    },
    {
        "slug": "erp-gestao-importacao-exportacao-software-comex",
        "title": "ERP para Comercio Exterior: Software de Gestao de Importacao e Exportacao",
        "excerpt": "Guia completo sobre ERP para comercio exterior: funcionalidades essenciais, integracao Siscomex, automacao de processos e criterios de selecao de software.",
        "readTime": 14,
        "tags": ["ERP", "Software", "Gestao", "Tecnologia", "Comercio Exterior"]
    },
    {
        "slug": "automacao-processos-aduaneiros-digitais",
        "title": "Automacao de Processos Aduaneiros: Digitalizacao no Despacho",
        "excerpt": "Guia completo sobre automacao de processos aduaneiros: RPA, inteligencia artificial, blockchain e digitalizacao do despacho aduaneiro no Brasil.",
        "readTime": 13,
        "tags": ["Automacao", "Aduana", "Digitalizacao", "Despacho Aduaneiro", "Comercio Exterior"]
    },
    {
        "slug": "confirming-exportacao-antecipacao-recebiveis",
        "title": "Confirming na Exportacao: Antecipacao de Recebiveis",
        "excerpt": "Guia completo sobre confirming na exportacao: como funciona, diferencas para ACC/ACE, custos, estrutura juridica e tendencias como blockchain e tokenizacao.",
        "readTime": 16,
        "tags": ["Confirming", "Exportacao", "Financiamento", "Recebiveis", "Comercio Exterior"]
    },
    {
        "slug": "forfaiting-mercado-secundario-credito-exportacao",
        "title": "Forfaiting no Comercio Exterior: Credito em Mercado Secundario",
        "excerpt": "Guia completo sobre forfaiting no comercio exterior: mercado secundario de credito, instrumentos cambiais, comparacao com ACC/ACE e factoring, e implementacao.",
        "readTime": 19,
        "tags": ["Forfaiting", "Credito", "Exportacao", "Financiamento", "Comercio Exterior"]
    },
    {
        "slug": "recof-regime-aduaneiro-entreposto-industrial",
        "title": "RECOF: Regime Aduaneiro de Entreposto Industrial",
        "excerpt": "Guia completo sobre o RECOF (Regime Aduaneiro de Entreposto Industrial): beneficios, fases de operacao, requisitos, comparacao com Drawback e implementacao.",
        "readTime": 20,
        "tags": ["RECOF", "Regime Aduaneiro", "Entreposto Industrial", "Importacao", "Comercio Exterior"]
    },
    {
        "slug": "reporto-incentivos-ferroviario-portuario",
        "title": "REPORTO: Incentivos ao Setor Ferroviario e Portuario",
        "excerpt": "Guia completo sobre o REPORTO: beneficios fiscais para ferrovias e portos, bens elegiveis, processo de habilitacao e impacto na competitividade brasileira.",
        "readTime": 20,
        "tags": ["REPORTO", "Ferroviario", "Portuario", "Incentivos Fiscais", "Comercio Exterior"]
    },
    {
        "slug": "certificacao-carbono-neutro-exportacao-brasil",
        "title": "Certificacao Carbono Neutro na Exportacao Brasileira",
        "excerpt": "Guia completo sobre certificacao carbono neutro na exportacao brasileira: metodologias, processo de certificacao, CBAM, custos e tendencias para 2027.",
        "readTime": 20,
        "tags": ["Carbono Neutro", "Sustentabilidade", "Exportacao", "Certificacao", "Comercio Exterior"]
    },
    {
        "slug": "acordo-paris-mudancas-climaticas-regulacao-comex",
        "title": "Acordo de Paris e o Impacto nas Regulacoes de Comercio Exterior",
        "excerpt": "Guia completo sobre o impacto do Acordo de Paris no comercio exterior: CBAM, barreiras tecnicas verdes, precificacao de carbono e estrategias para exportadores.",
        "readTime": 14,
        "tags": ["Acordo de Paris", "Mudancas Climaticas", "Regulacao", "Sustentabilidade", "Comercio Exterior"]
    },
    {
        "slug": "iso-9001-qualidade-cadeia-fornecedores-internacional",
        "title": "ISO 9001 na Cadeia de Fornecedores Internacionais",
        "excerpt": "Guia completo sobre ISO 9001 na cadeia de fornecedores internacionais: principios, beneficios, desafios culturais, avaliacao multicamadas e tendencias.",
        "readTime": 15,
        "tags": ["ISO 9001", "Qualidade", "Fornecedores", "Certificacao", "Comercio Exterior"]
    },
    {
        "slug": "marketplace-alibaba-mercado-livre-shopee-exportacao",
        "title": "Marketplaces Internacionais: Alibaba, Mercado Livre e Shopee na Exportacao",
        "excerpt": "Guia completo sobre marketplaces internacionais para exportadores brasileiros: Alibaba.com, Mercado Livre e Shopee, estrategias, precificacao e documentacao.",
        "readTime": 21,
        "tags": ["Marketplace", "E-commerce", "Alibaba", "Mercado Livre", "Shopee", "Exportacao"]
    },
    {
        "slug": "site-exportador-multilingue-captacao-leads",
        "title": "Site Exportador Multilingue: Captacao de Leads Internacionais",
        "excerpt": "Guia completo sobre site exportador multilingue: estrutura tecnica, SEO internacional, hreflang, estrategia de conteudo, CRM e metricas de captacao de leads.",
        "readTime": 21,
        "tags": ["Site", "Multilingue", "Captacao de Leads", "Marketing Digital", "Exportacao"]
    },
    {
        "slug": "sandbox-regulatorio-inovacao-startup-comex",
        "title": "Sandbox Regulatorio no Comex: Inovacao para Startups",
        "excerpt": "Guia completo sobre sandbox regulatorio no comercio exterior: Marco Legal das Startups, experiencias internacionais, oportunidades e desafios para inovacao.",
        "readTime": 16,
        "tags": ["Sandbox", "Inovacao", "Startups", "Regulacao", "Comercio Exterior"]
    },
    {
        "slug": "startup-comex-primeiros-passos-importacao-exportacao",
        "title": "Startup no Comex: Primeiros Passos para Importar e Exportar",
        "excerpt": "Guia completo para startups no comercio exterior: primeiros passos para importar e exportar, planejamento, documentacao, tributacao, logistica e ferramentas.",
        "readTime": 18,
        "tags": ["Startup", "Comex", "Importacao", "Exportacao", "Inovacao", "Comercio Exterior"]
    },
    {
        "slug": "seguro-carga-importacao-exportacao-coberturas",
        "title": "Seguro de Carga na Importacao e Exportacao: Coberturas e Contratacao",
        "excerpt": "Guia completo sobre seguro de carga no comercio exterior: tipos de cobertura, riscos, contratacao, regulacao de sinistros e tendencias do mercado segurador.",
        "readTime": 19,
        "tags": ["Seguro", "Carga", "Importacao", "Exportacao", "Logistica", "Comercio Exterior"]
    },
    {
        "slug": "conhecimento-embarque-aereo-aeb-documentacao",
        "title": "Conhecimento de Embarque Aereo (AEB): Guia Completo de Documentacao",
        "excerpt": "Guia completo sobre o Conhecimento de Embarque Aereo (AEB): estrutura, tipos, diferencas para BL maritimo, documentacao complementar e erros comuns.",
        "readTime": 21,
        "tags": ["AEB", "Conhecimento de Embarque", "Transporte Aereo", "Documentacao", "Comercio Exterior"]
    },
    {
        "slug": "incoterms-2020-tabela-completa-responsabilidades",
        "title": "Incoterms 2020: Tabela Completa de Responsabilidades no Comercio Internacional",
        "excerpt": "Guia completo sobre Incoterms 2020 com tabela detalhada de responsabilidades: todos os 11 termos, criterios de escolha, erros comuns e calculo de custos.",
        "readTime": 21,
        "tags": ["Incoterms", "Logistica", "Responsabilidades", "Comercio Internacional", "Frete"]
    },
    {
        "slug": "consolidador-carga-frete-maritimo-lcl-fcl",
        "title": "Consolidador de Carga no Frete Maritimo: LCL e FCL na Pratica",
        "excerpt": "Guia completo sobre consolidacao de carga maritima: LCL vs FCL, papel do consolidador, custos por rota, documentacao HBL/MBL e criterios de selecao.",
        "readTime": 22,
        "tags": ["Consolidacao", "Frete Maritimo", "LCL", "FCL", "Logistica", "Comercio Exterior"]
    },
    {
        "slug": "operador-logistico-3pl-cadeia-suprimentos",
        "title": "Operador Logistico 3PL na Cadeia de Suprimentos Internacional",
        "excerpt": "Guia completo sobre operadores logisticos 3PL no comercio exterior: servicos, beneficios, criterios de selecao, tecnologia e tendencias como automacao e IA.",
        "readTime": 16,
        "tags": ["3PL", "Operador Logistico", "Supply Chain", "Logistica", "Comercio Exterior"]
    },
    {
        "slug": "reforma-tributaria-2026-ec-132-impacto-comex",
        "title": "Reforma Tributaria 2026 (EC 132): Impactos no Comercio Exterior",
        "excerpt": "Guia completo sobre a Reforma Tributaria EC 132 e seus impactos no comercio exterior brasileiro: IBS, CBS, IS, regimes aduaneiros e cronograma de transicao.",
        "readTime": 17,
        "tags": ["Reforma Tributaria", "EC 132", "Tributacao", "IBS", "CBS", "Comercio Exterior"]
    },
    {
        "slug": "ncm-classificacao-fiscal-mercadorias-dominio",
        "title": "NCM: Dominio da Classificacao Fiscal de Mercadorias",
        "excerpt": "Guia completo sobre dominio da classificacao fiscal NCM: estrutura SH, RGI, notas explicativas, desafios praticos e tecnologia com classificadores de IA.",
        "readTime": 14,
        "tags": ["NCM", "Classificacao Fiscal", "Mercadorias", "SH", "Tributacao", "Comercio Exterior"]
    },
    {
        "slug": "classificacao-ncm-maquinas-cap-84",
        "title": "Classificacao NCM de Maquinas e Equipamentos: Capitulo 84",
        "excerpt": "Guia completo sobre classificacao NCM do Capitulo 84: estruturas, regras especificas, posicoes criticas e tratamento tributario para maquinas e equipamentos.",
        "readTime": 15,
        "tags": ["NCM", "Maquinas", "Capitulo 84", "Classificacao Fiscal", "Equipamentos", "Comercio Exterior"]
    },
    {
        "slug": "classificacao-ncm-eletronicos-cap-85",
        "title": "Classificacao NCM de Eletronicos: Capitulo 85",
        "excerpt": "Guia completo sobre classificacao NCM do Capitulo 85: estrutura, desafios tecnologics, erros comuns, casos praticos e uso de IA na classificacao de eletronicos.",
        "readTime": 12,
        "tags": ["NCM", "Eletronicos", "Capitulo 85", "Classificacao Fiscal", "Comercio Exterior"]
    },
    {
        "slug": "classificacao-ncm-veiculos-cap-87",
        "title": "Classificacao NCM de Veiculos e Autopecas: Capitulo 87",
        "excerpt": "Guia completo sobre classificacao NCM do Capitulo 87: veiculos, autopecas, regras especiais, tratamento tributario e casos praticos de classificacao.",
        "readTime": 13,
        "tags": ["NCM", "Veiculos", "Autopecas", "Capitulo 87", "Classificacao Fiscal", "Comercio Exterior"]
    },
    {
        "slug": "regras-origem-acordos-comerciais-mercosul",
        "title": "Regras de Origem em Acordos Comerciais: Mercosul e Preferencias Tarifarias",
        "excerpt": "Guia completo sobre regras de origem no comercio exterior: criterios Mercosul, conteudo regional, certificacao, acumulacao e tecnologia na gestao de origem.",
        "readTime": 14,
        "tags": ["Regras de Origem", "Mercosul", "Acordos Comerciais", "Preferencias Tarifarias", "Comercio Exterior"]
    },
    {
        "slug": "selo-qualidade-exportacao-brasil-certificacao",
        "title": "Selo de Qualidade para Exportacao: Certificacoes Brasileiras Reconhecidas",
        "excerpt": "Guia completo sobre selos de qualidade para exportacao brasileira: Inmetro, ISO, CE, USDA Organic, FSC, BRCGS, Halal, Kosher e processo de obtencao.",
        "readTime": 14,
        "tags": ["Qualidade", "Certificacao", "Selo", "Exportacao", "Padroes Internacionais", "Comercio Exterior"]
    },
]

DATE = "2026-06-26"
BASE = "/home/nuh_tapinar/tmp-build/project-clean"

def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    return f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'

def build_prerender_entry(p):
    return f'  {{ slug: "{p["slug"]}", name: "{p["title"]}", desc: "{p["excerpt"]}" }},'

def insert_before_line(lines, marker, entries):
    """Find marker line and insert entries before it."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            pos = i
            break
    else:
        raise ValueError(f"Marker '{marker}' not found")
    for j, entry in enumerate(entries):
        lines.insert(pos + j, entry + "\n")

# --- STEP 1: postMeta.ts ---
meta_path = f"{BASE}/src/data/blog/postMeta.ts"
with open(meta_path) as f:
    meta_lines = f.readlines()
meta_entries = [build_meta_entry(p) for p in NEW_POSTS]
insert_before_line(meta_lines, "];", meta_entries)
with open(meta_path, "w") as f:
    f.writelines(meta_lines)
print(f"✅ postMeta.ts: inserted {len(meta_entries)} entries")

# --- STEP 2: postContentMap.ts ---
map_path = f"{BASE}/src/data/blog/postContentMap.ts"
with open(map_path) as f:
    map_lines = f.readlines()
# Find the }; that closes the map object (has getPostContent nearby)
close_map = None
for i in range(len(map_lines) - 1, -1, -1):
    if map_lines[i].strip() == "};":
        # Check if getPostContent is within next 4 lines
        for j in range(i + 1, min(i + 4, len(map_lines))):
            if "export async function getPostContent" in map_lines[j]:
                close_map = i
                break
        if close_map is not None:
            break
if close_map is None:
    raise ValueError("Could not find map closing }; near getPostContent")
map_entries = [f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),' for p in NEW_POSTS]
for j, entry in enumerate(map_entries):
    map_lines.insert(close_map + j, entry + "\n")
with open(map_path, "w") as f:
    f.writelines(map_lines)
print(f"✅ postContentMap.ts: inserted {len(map_entries)} entries")

# --- STEP 3: prerender.mjs ---
prerender_path = f"{BASE}/scripts/prerender.mjs"
with open(prerender_path) as f:
    pre_lines = f.readlines()
# Find the LAST ]; (BLOG_POSTS array)
last_close = None
for i in range(len(pre_lines) - 1, -1, -1):
    if pre_lines[i].strip() == "];":
        last_close = i
        break
if last_close is None:
    raise ValueError("Could not find ]; in prerender.mjs")
prerender_entries = [build_prerender_entry(p) for p in NEW_POSTS]
for j, entry in enumerate(prerender_entries):
    pre_lines.insert(last_close + j, entry + "\n")
with open(prerender_path, "w") as f:
    f.writelines(pre_lines)
print(f"✅ prerender.mjs: inserted {len(prerender_entries)} entries")

print("\n=== POST-INTEGRATION COUNTS ===")
print(f"postMeta: {sum(1 for l in meta_lines if 'slug: ' in l) + len(NEW_POSTS)}")
print(f"contentMap: {sum(1 for l in map_lines if ': () => import' in l) + len(NEW_POSTS)}")
print(f"prerender BLOG_POSTS: {sum(1 for l in pre_lines if 'slug: ' in l) + len(NEW_POSTS)}")
print(f"content files: {len(NEW_POSTS) + 1030}")
