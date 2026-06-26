#!/usr/bin/env python3
"""
Integration script for 30 new blog posts (June 26 PM run).
Line-based insertion into postMeta.ts, postContentMap.ts, prerender.mjs.
No content field in postMeta (code-split format).
"""
import re
from datetime import datetime

DATE = "2026-06-26"

# Slug -> (title, excerpt, readTime, tags)
POSTS = {
    "classificacao-ncm-produtos-quimicos-cap-28-38": (
        "Classificação NCM de Produtos Químicos: Guia dos Capítulos 28 a 38",
        "Guia completo sobre classificação NCM de produtos químicos nos capítulos 28 a 38: regras de classificação, produtos inorgânicos e orgânicos, adubos e extrativos. Exemplos práticos.",
        20,
        ["NCM", "Classificação Fiscal", "Produtos Químicos", "Importação", "Comércio Exterior"]
    ),
    "classificacao-ncm-plasticos-borracha-cap-39-40": (
        "Classificação NCM de Plásticos e Borracha: Guia Capítulos 39 e 40",
        "Guia completo sobre classificação NCM de plásticos e suas obras (cap 39) e borracha e suas obras (cap 40): regras, subposições e classificação de artefatos.",
        22,
        ["NCM", "Classificação Fiscal", "Plásticos", "Borracha", "Importação"]
    ),
    "classificacao-ncm-calcados-cap-64": (
        "Classificação NCM de Calçados: Guia do Capítulo 64",
        "Guia completo sobre classificação NCM de calçados no capítulo 64: tipos de solado, cabedal, classificações especiais e NCMs mais usados na importação e exportação.",
        18,
        ["NCM", "Classificação Fiscal", "Calçados", "Importação", "Exportação"]
    ),
    "classificacao-ncm-alimentos-bebidas-cap": (
        "Classificação NCM de Alimentos e Bebidas: Guia por Capítulos",
        "Guia completo sobre classificação NCM de alimentos e bebidas nos capítulos 1 a 24: regras do Sistema Harmonizado, classificações comuns e erros frequentes.",
        18,
        ["NCM", "Classificação Fiscal", "Alimentos", "Bebidas", "Importação"]
    ),
    "classificacao-ncm-moveis-cap-94": (
        "Classificação NCM de Móveis: Guia do Capítulo 94",
        "Guia completo sobre classificação NCM de móveis no capítulo 94: escritório, cozinha, quarto, colchões, luminárias, partes de móveis e regras de classificação.",
        16,
        ["NCM", "Classificação Fiscal", "Móveis", "Importação", "Comércio Exterior"]
    ),
    "conteinerizacao-carga-containers-maritimos": (
        "Conteinerização de Carga: Tipos de Containers e Boas Práticas",
        "Guia completo sobre conteinerização de carga no comércio exterior: tipos de containers marítimos, dimensões, cargas adequadas, unitização e cuidados no transporte.",
        17,
        ["Logística", "Containers", "Transporte Marítimo", "Conteinerização", "Comércio Exterior"]
    ),
    "unitizacao-carga-escoramento-palletizacao": (
        "Unitização de Carga no Comex: Palletização e Escoramento",
        "Guia completo sobre unitização de carga no comércio exterior: palletização, escoramento, tipos de pallets, fitas, filmes, normas NBR e requisitos de transporte.",
        16,
        ["Logística", "Unitização", "Palletização", "Transporte", "Comércio Exterior"]
    ),
    "embalagem-exportacao-requisitos-certificacoes": (
        "Embalagem para Exportação: Requisitos e Certificações",
        "Guia completo sobre embalagem para exportação: requisitos fitossanitários NIMF 15, embalagem marítima e aérea, marcação, certificações e redução de custos logísticos.",
        18,
        ["Embalagem", "Exportação", "Logística", "Certificação", "Comércio Exterior"]
    ),
    "pesagem-carga-verificacao-vgm-solas": (
        "Pesagem de Carga no Comex: Verificação de Massa Bruta VGM/SOLAS",
        "Guia completo sobre pesagem de carga no comércio exterior: regras SOLAS para VGM, métodos de pesagem, responsabilidades, certificação de balanças e documentos.",
        20,
        ["Logística", "Pesagem", "SOLAS", "VGM", "Transporte Marítimo", "Comércio Exterior"]
    ),
    "portos-secos-estacoes-aduaneiras-interior": (
        "Portos Secos e EADI: Estações Aduaneiras no Interior",
        "Guia completo sobre portos secos (EADI): funcionamento, benefícios, processos, cargas permitidas e comparação com recintos primários no comércio exterior brasileiro.",
        19,
        ["Portos Secos", "EADI", "Logística", "Recintos Alfandegados", "Comércio Exterior"]
    ),
    "cisg-convencao-viena-compra-venda-mercadorias": (
        "CISG: Convenção de Viena para Compra e Venda Internacional de Mercadorias",
        "Guia completo sobre a CISG (Convenção de Viena de 1980): aplicação, formação do contrato, obrigações das partes, transferência de riscos e jurisprudência internacional.",
        17,
        ["CISG", "Convenção de Viena", "Contratos", "Direito Internacional", "Comércio Exterior"]
    ),
    "contrato-agencia-comercial-representacao": (
        "Contrato de Agência Comercial Internacional: Guia Completo",
        "Guia completo sobre contrato de agência comercial internacional: diferenças para distribuição, comissão, exclusividade, rescisão e cláusulas essenciais.",
        18,
        ["Agência Comercial", "Contratos", "Representação", "Direito Internacional", "Exportação"]
    ),
    "transferencia-tecnologia-licenciamento-internacional": (
        "Transferência de Tecnologia e Licenciamento Internacional: Guia",
        "Guia completo sobre transferência de tecnologia: contratos de licenciamento, know-how, assistência técnica, INPI, royalties e tributação de remessas ao exterior.",
        20,
        ["Transferência de Tecnologia", "Licenciamento", "INPI", "Royalties", "Comércio Exterior"]
    ),
    "solucao-controversias-omc-disputas-comerciais": (
        "Solução de Controvérsias na OMC: Disputas Comerciais Internacionais",
        "Guia completo sobre o sistema de solução de controvérsias da OMC: etapas, painéis, apelação, casos emblemáticos e impacto no Brasil.",
        19,
        ["OMC", "Controvérsias", "Disputas Comerciais", "Direito Internacional", "Comércio Exterior"]
    ),
    "franchising-franquia-modelo-internacional": (
        "Franquia Internacional: Modelos, Tributação e Expansão Global",
        "Guia completo sobre franquia internacional: modelos de expansão, contrato, tributação de royalties, remessas ao exterior e estratégias de internacionalização de marcas.",
        18,
        ["Franquia", "Franchising", "Internacionalização", "Royalties", "Exportação"]
    ),
    "rcep-acordo-asia-pacifico-comercio": (
        "RCEP: Acordo de Parceria Regional da Ásia-Pacífico",
        "Guia completo sobre o RCEP: países membros, regras de origem, tarifas, oportunidades para o Brasil e impactos no comércio global da Ásia-Pacífico.",
        18,
        ["RCEP", "Acordos Comerciais", "Ásia-Pacífico", "Tarifas", "Comércio Exterior"]
    ),
    "acordo-mercosul-china-perspectivas": (
        "Acordo Mercosul-China: Perspectivas e Impactos no Comércio",
        "Guia completo sobre as negociações do acordo Mercosul-China: cronograma, pauta tarifária, setores beneficiados e impacto nas importações e exportações brasileiras.",
        17,
        ["Mercosul", "China", "Acordos Comerciais", "Tarifas", "Comércio Exterior"]
    ),
    "omc-acordos-multilaterais-comercio-global": (
        "OMC e os Acordos Multilaterais de Comércio Global",
        "Guia completo sobre os principais acordos multilaterais da OMC: GATT, GATS, TRIPS, Acordo de Facilitação de Comércio e impacto no Brasil.",
        19,
        ["OMC", "GATT", "GATS", "TRIPS", "Facilitação de Comércio", "Comércio Exterior"]
    ),
    "mercados-africanos-lusofonos-oportunidades": (
        "Mercados Africanos Lusófonos: Oportunidades para Exportadores Brasileiros",
        "Guia completo sobre comércio com países africanos lusófonos: Angola, Moçambique, Cabo Verde, Guiné-Bissau e São Tomé. Oportunidades, logística e documentação.",
        22,
        ["África", "Países Lusófonos", "Angola", "Moçambique", "Exportação", "Comércio Exterior"]
    ),
    "acordo-mercosul-india-perspectivas": (
        "Acordo Mercosul-Índia: Perspectivas e Oportunidades Comerciais",
        "Guia completo sobre o acordo preferencial Mercosul-Índia: produtos contemplados, regras de origem, reduções tarifárias e setores mais beneficiados.",
        17,
        ["Mercosul", "Índia", "Acordos Comerciais", "Tarifas", "Comércio Exterior"]
    ),
    "lucro-presumido-comercio-exterior-guia": (
        "Lucro Presumido no Comércio Exterior: Guia para Importadores e Exportadores",
        "Guia completo sobre Lucro Presumido para empresas de comex: cálculo, alíquotas, limites, exportação, importação, PIS/COFINS cumulativo e planejamento tributário.",
        19,
        ["Lucro Presumido", "Tributação", "IRPJ", "CSLL", "Planejamento Tributário", "Importação"]
    ),
    "simples-nacional-exportacao-limites-oportunidades": (
        "Simples Nacional na Exportação: Limites, Regras e Oportunidades",
        "Guia completo sobre o Simples Nacional na exportação: limites de receita, tributação, ICMS, benefícios fiscais, desenquadramento e oportunidades para ME/EPP.",
        17,
        ["Simples Nacional", "Exportação", "Tributação", "MEI", "ME", "EPP", "Comércio Exterior"]
    ),
    "drawback-suspensao-isencao-intermediario-comparativo": (
        "Drawback: Suspensão, Isenção e Intermediário — Guia Comparativo",
        "Guia completo comparativo dos regimes de drawback: suspensão, isenção e intermediário. Diferenças, aplicação, Ato Concessório, prestação de contas e vantagens.",
        21,
        ["Drawback", "Regimes Aduaneiros", "Suspensão", "Isenção", "Exportação"]
    ),
    "regimes-aduaneiros-especiais-comparativo-pratico": (
        "Regimes Aduaneiros Especiais: Guia Comparativo Prático",
        "Guia completo com comparativo prático dos regimes aduaneiros especiais: RECOF, REPORTO, RECAP, PROCOM, Drawback, Ex-tarifário e Zona Franca de Manaus.",
        22,
        ["Regimes Aduaneiros", "RECOF", "REPORTO", "RECAP", "Drawback", "Zona Franca de Manaus"]
    ),
    "royalties-pagamento-remessa-tecnologia-estrangeira": (
        "Royalties: Pagamento e Remessa ao Exterior por Transferência de Tecnologia",
        "Guia completo sobre pagamento de royalties ao exterior: contratos de licenciamento, INPI, tributação IRRF/CIDE, acordos de bitributação e remessas ao BACEN.",
        18,
        ["Royalties", "Remessas", "Transferência de Tecnologia", "INPI", "Tributação"]
    ),
    "controle-exportacao-bens-uso-dual": (
        "Controle de Exportação de Bens de Uso Dual: Guia Completo",
        "Guia completo sobre controle de exportação de bens de uso dual: lista de produtos controlados, licenças MDIC/Exército, sanções internacionais e compliance.",
        16,
        ["Controle de Exportação", "Bens de Uso Dual", "Licenciamento", "Defesa", "Compliance"]
    ),
    "anticorrupcao-lei-brasileira-comex": (
        "Lei Anticorrupção no Comércio Exterior: Compliance e Prevenção",
        "Guia completo sobre a Lei Anticorrupção (Lei 12.846/2013) no comex: responsabilização, sanções, compliance, due diligence de parceiros e convênios internacionais.",
        17,
        ["Anticorrupção", "Compliance", "Lei 12.846", "Due Diligence", "Comércio Exterior"]
    ),
    "programa-integridade-compliance-comex-estrategico": (
        "Programa de Integridade no Comex: Estruturação Estratégica",
        "Guia completo sobre programa de integridade para empresas de comex: pilares, código de conduta, canais de denúncia, monitoramento e due diligence de fornecedores.",
        18,
        ["Programa de Integridade", "Compliance", "Código de Conduta", "Due Diligence", "Comércio Exterior"]
    ),
    "joint-venture-internacional-estruturacao-societaria": (
        "Joint Venture Internacional: Estruturação Societária e Legal",
        "Guia completo sobre joint venture internacional no comex: modelos societários, acordo de acionistas, PI, tributação, câmbio e estratégias de saída.",
        19,
        ["Joint Venture", "Sociedades", "Acordo de Acionistas", "Investimento", "Comércio Exterior"]
    ),
    "cadeia-fria-logistica-pereciveis-exportacao": (
        "Cadeia do Frio na Exportação: Logística de Produtos Perecíveis",
        "Guia completo sobre cadeia do frio na exportação: containers reefer, monitoramento de temperatura, certificações, documentos fitossanitários para produtos perecíveis.",
        18,
        ["Cadeia do Frio", "Logística", "Perecíveis", "Reefer", "Exportação", "Certificação"]
    ),
}

# ===== POSTMETA =====
with open("src/data/blog/postMeta.ts", "r") as f:
    meta_lines = f.readlines()

# Find last ]; in postMeta
close_pos = None
for i in range(len(meta_lines) - 1, -1, -1):
    if meta_lines[i].strip() == "];":
        close_pos = i
        break

meta_entries = []
for slug, (title, excerpt, rt, tags) in POSTS.items():
    tag_str = ", ".join(f'"{t}"' for t in tags)
    meta_entries.append(f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {rt}, tags: [{tag_str}] }},')

for j, entry in enumerate(meta_entries):
    meta_lines.insert(close_pos + j, entry + "\n")

with open("src/data/blog/postMeta.ts", "w") as f:
    f.writelines(meta_lines)

print(f"✅ postMeta.ts: inserted {len(meta_entries)} entries before line {close_pos+1}")

# ===== POSTCONTENTMAP =====
with open("src/data/blog/postContentMap.ts", "r") as f:
    content = f.read()

map_close = content.rfind("\n};")
# Verify this is the map's }; by checking getPostContent nearby
remaining = content[map_close:]
if "getPostContent" not in remaining:
    # Try finding the }; that precedes getPostContent
    for m in re.finditer(r'\n\};', content):
        pos = m.start()
        after = content[pos:pos+200]
        if "getPostContent" in after:
            map_close = pos
            break

insert_before = "\n" + "".join(
    f'  "{slug}": () => import("./content/{slug}"),\n' for slug in POSTS.keys()
)

content = content[:map_close] + insert_before + content[map_close:]

with open("src/data/blog/postContentMap.ts", "w") as f:
    f.write(content)

print(f"✅ postContentMap.ts: inserted {len(POSTS)} lazy-load entries")

# ===== PRERENDER =====
with open("scripts/prerender.mjs", "r") as f:
    prerender_lines = f.readlines()

# Find last ]; (the BLOG_POSTS closing)
blog_end = None
for i in range(len(prerender_lines) - 1, -1, -1):
    if prerender_lines[i].strip() == "];":
        blog_end = i
        break

prerender_entries = []
for slug, (title, excerpt, rt, tags) in POSTS.items():
    # Sanitize title for single quotes in desc
    desc = excerpt.replace("'", " ")
    prerender_entries.append(f'  {{ slug: "{slug}", name: "{title}", desc: "{desc}" }},')

for j, entry in enumerate(prerender_entries):
    prerender_lines.insert(blog_end + j, entry + "\n")

with open("scripts/prerender.mjs", "w") as f:
    f.writelines(prerender_lines)

print(f"✅ prerender.mjs: inserted {len(prerender_entries)} BLOG_POSTS entries")

# ===== VERIFICATION =====
print("\n=== VERIFICATION ===")
meta_count = sum(1 for l in open("src/data/blog/postMeta.ts") if 'slug: "' in l)
map_count = sum(1 for l in open("src/data/blog/postContentMap.ts") if '() => import' in l)
content_count = len([l for l in open("src/data/blog/content/") if l.strip()])

import os
content_files = os.listdir("src/data/blog/content/")
content_count = len([f for f in content_files if f.endswith('.ts')])

# Count entries in prerender BLOG_POSTS (only inside the BLOG_POSTS array)
with open("scripts/prerender.mjs") as f:
    pr_lines = f.readlines()
in_blog = False
prerender_blog_count = 0
for line in pr_lines:
    if "const BLOG_POSTS" in line:
        in_blog = True
    elif in_blog and line.strip() == "];":
        break
    elif in_blog and 'slug:' in line:
        prerender_blog_count += 1

print(f"postMeta entries:            {meta_count}")
print(f"contentMap entries:          {map_count}")
print(f"content/ files:              {content_count}")
print(f"prerender BLOG_POSTS:        {prerender_blog_count}")
print("✅ Integration complete!")
