#!/usr/bin/env python3
"""Integration script for 30 new TRADEXA blog posts (June 25 2026, 15:00).
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs (project-clean).
Line-specific marker insertion — no rfind +1 bugs."""

import os
import re
import sys

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-25"

# ── POST DATA: (slug, title, excerpt, word_count, [tags]) ──
POSTS = [
    ("incoterms-2025-mudancas", "Incoterms 2025: O que Mudou e Como Aplicar nas Negociações Internacionais", "Guia completo sobre as mudanças dos Incoterms 2025, novas regras, responsabilidades e como aplicar cada termo nas negociações internacionais de importação e exportação.", 2500, ["Incoterms", "Exportação", "Logística Internacional"]),
    ("exw-fob-diferencas-aplicacao", "EXW vs FOB: Diferenças, Vantagens e Quando Usar Cada Incoterm", "Comparativo completo entre EXW e FOB: diferenças de responsabilidades, custos, riscos e quando escolher cada Incoterm nas operações de comércio exterior.", 2400, ["Incoterms", "Exportação", "Importação"]),
    ("cip-cif-responsabilidades-seguros", "CIP vs CIF: Responsabilidades, Seguros e Diferenças Práticas", "Guia detalhado comparando CIP e CIF: cobertura de seguros, transferência de riscos, custos e recomendações para cada modalidade de transporte.", 2500, ["Incoterms", "Seguros", "Logística Internacional"]),
    ("incoterms-multimodal-transporte", "Incoterms para Transporte Multimodal: Guia Completo", "Guia completo sobre a aplicação dos Incoterms no transporte multimodal, incluindo regras para múltiplos modais, responsabilidades e documentos.", 2600, ["Incoterms", "Transporte Multimodal", "Logística"]),
    ("parametrizacao-importacao-canais-verde-amarelo-vermelho-cinza", "Parametrização na Importação: Canais Verde, Amarelo, Vermelho e Cinza", "Guia completo sobre parametrização aduaneira: como funcionam os canais de conferência, critérios de seleção e procedimentos para cada canal.", 2800, ["Importação", "Receita Federal", "Despacho Aduaneiro"]),
    ("canal-cinza-importacao-procedimentos", "Canal Cinza na Importação: Como Evitar, Procedimentos e Regularização", "Guia completo sobre o canal cinza na importação: causas, procedimentos de conferência, documentação exigida e como evitar a parametrização no canal cinza.", 2700, ["Importação", "Receita Federal", "Despacho Aduaneiro"]),
    ("declaracao-importacao-di-completa", "Declaração de Importação (DI): Passo a Passo Completo", "Guia completo da Declaração de Importação: como preencher cada campo, documentos necessários, prazos, retificações e dicas para evitar erros.", 3000, ["Importação", "Siscomex", "Despacho Aduaneiro"]),
    ("declaracao-unica-exportacao-due-guia", "Declaração Única de Exportação (DU-E): Manual Completo", "Guia completo da DU-E: como emitir, preencher, retificar e gerenciar a Declaração Única de Exportação no Siscomex, com passo a passo e exemplos práticos.", 2800, ["Exportação", "Siscomex", "Despacho Aduaneiro"]),
    ("transito-aduaneiro-brasil-regimes", "Trânsito Aduaneiro no Brasil: Regimes, Procedimentos e Benefícios", "Guia completo sobre trânsito aduaneiro: regimes, procedimentos, garantias, prazos e benefícios para transportar mercadorias sob controle aduaneiro.", 2600, ["Logística", "Despacho Aduaneiro", "Receita Federal"]),
    ("siscomex-exportacao-modulos-registro", "Siscomex Exportação: Módulos, Registro e Operação Completa", "Guia completo do Siscomex Exportação: módulos, etapas de registro, documentos, prazos e procedimentos para exportar pelo sistema integrado.", 2800, ["Exportação", "Siscomex", "Despacho Aduaneiro"]),
    ("siscomex-importacao-sisbacen-cambio", "Siscomex Importação: SISBACEN, Câmbio e Fechamento de Contrato", "Guia completo sobre o Siscomex Importação, integração com SISBACEN, operações de câmbio, fechamento de contrato e procedimentos aduaneiros.", 2800, ["Importação", "Siscomex", "Câmbio"]),
    ("siscomex-estatistico-consulta-dados", "Siscomex Estatístico: Como Consultar Dados de Comércio Exterior", "Guia prático do Siscomex Estatístico: como consultar dados oficiais de importação e exportação, interpretar relatórios e usar informações para inteligência de mercado.", 2600, ["Inteligência de Mercado", "Siscomex", "Dados"]),
    ("pis-cofins-importacao-nao-cumulatividade", "PIS/COFINS na Importação: Regime Não-Cumulativo e Créditos", "Guia completo sobre PIS/COFINS na importação: alíquotas, base de cálculo, regime não-cumulativo, apropriação de créditos e obrigações acessórias.", 2800, ["Importação", "Tributação", "PIS/COFINS"]),
    ("icms-importacao-diferencial-aliquota", "ICMS na Importação: Diferencial de Alíquota e Cálculo", "Guia completo sobre ICMS na importação: diferencial de alíquota, base de cálculo, convênios, substituição tributária e impacto no custo final.", 2800, ["Importação", "Tributação", "ICMS"]),
    ("iof-cambio-operacoes-cambiais-importacao", "IOF nas Operações de Câmbio: Impacto nas Importações e Exportações", "Guia completo sobre IOF nas operações de câmbio: alíquotas para importação e exportação, base de cálculo, operações isentas e planejamento tributário.", 2500, ["Tributação", "Câmbio", "Importação"]),
    ("ipi-fato-gerador-importacao-aliquota", "IPI na Importação: Fato Gerador, Alíquotas e Cálculos", "Guia completo sobre IPI na importação: fato gerador, alíquotas por NCM, base de cálculo, créditos e desonerações para produtos industrializados.", 2600, ["Importação", "Tributação", "IPI"]),
    ("tributacao-consolidada-importacao-custos", "Tributação Consolidada na Importação: Cálculo Total de Custos", "Guia completo para calcular a tributação consolidada na importação: II, IPI, PIS, COFINS, ICMS, AFRMM e demais encargos com exemplos práticos.", 3000, ["Importação", "Tributação", "Custos"]),
    ("recolhimento-tributos-federais-comex", "Recolhimento de Tributos Federais no Comércio Exterior: DARF e Pagamentos", "Guia completo sobre recolhimento de tributos federais no comércio exterior: DARF, código de receita, pagamento unificado, prazos e procedimentos.", 2500, ["Tributação", "Importação", "Exportação"]),
    ("exportacao-servicos-guia-completo", "Exportação de Serviços: Guia Completo de Tributação e Procedimentos", "Guia completo sobre exportação de serviços: tributação, câmbio, contratos, documentos e benefícios fiscais para empresas prestadoras de serviços internacionais.", 2800, ["Exportação", "Serviços", "Tributação"]),
    ("importacao-servicos-tributacao-cambio", "Importação de Serviços: Tributação, Câmbio e Remessas", "Guia completo sobre importação de serviços: tributação, câmbio, remessas ao exterior, contratos e obrigações acessórias.", 2700, ["Importação", "Serviços", "Câmbio"]),
    ("royalties-assistencia-tecnica-comex", "Royalties e Assistência Técnica no Comércio Exterior", "Guia completo sobre royalties e assistência técnica no comércio exterior: contratos, tributação, remessas, INPI e acordos para evitar bitributação.", 2800, ["Tributação", "Serviços", "Propriedade Intelectual"]),
    ("remessas-internacionais-cambio-valores", "Remessas Internacionais: Câmbio, Valores e Tributação", "Guia completo sobre remessas internacionais para comércio exterior: limites, documentação, contratos de câmbio, IOF e obrigações cambiais.", 2600, ["Câmbio", "Serviços", "Tributação"]),
    ("software-saas-importacao-tributacao", "Importação de Software e SaaS: Tributação e Licenças", "Guia completo sobre importação de software e SaaS: tributação, licenças, remessas, INPI e aspectos legais para empresas brasileiras.", 2600, ["Importação", "Serviços", "Tecnologia"]),
    ("armazenagem-alfandegada-porto-seco-eadi", "Armazenagem Alfandegada: Portos Secos, EADI e Recintos", "Guia completo sobre armazenagem alfandegada: portos secos, EADI, recintos alfandegados, custos, prazos e procedimentos.", 2700, ["Logística", "Armazenagem", "Importação"]),
    ("centro-distribuicao-internacional-logistica", "Centros de Distribuição Internacional: Estratégias e Implantação", "Guia completo sobre centros de distribuição internacional: estratégias, localização, custos, operações e integração com a cadeia de suprimentos.", 2600, ["Logística", "Distribuição", "Supply Chain"]),
    ("gestao-estoques-importacao-estrategias", "Gestão de Estoques na Importação: Estratégias e Práticas", "Guia completo sobre gestão de estoques para importadores: lead time, ponto de ressuprimento, custos, sazonalidade e sistemas de controle.", 2800, ["Logística", "Gestão", "Importação"]),
    ("cross-docking-importacao-logistica", "Cross-docking na Importação: Otimização Logística e Redução de Custos", "Guia completo sobre cross-docking na importação: como funciona, benefícios, desafios operacionais e implementação prática.", 2500, ["Logística", "Distribuição", "Armazenagem"]),
    ("operador-economico-autorizado-oea-guia", "OEA (Operador Econômico Autorizado): Guia Completo de Certificação", "Guia completo sobre o programa OEA: requisitos, certificação, benefícios, modalidades e passo a passo para se tornar Operador Econômico Autorizado.", 3000, ["Certificação", "Importação", "Exportação"]),
    ("linha-azul-importacao-beneficios", "Linha Azul: Desburocratização Aduaneira e Benefícios para Importadores", "Guia completo sobre a Linha Azul: como funciona, requisitos, benefícios, procedimentos e impacto na agilidade do despacho aduaneiro.", 2500, ["Importação", "Despacho Aduaneiro", "Receita Federal"]),
    ("recinto-alfandegado-zona-primaria-secundaria", "Recintos Alfandegados: Zona Primária, Secundária e Funcionamento", "Guia completo sobre recintos alfandegados: zona primária e secundária, funcionamento, requisitos, operações autorizadas e fiscalização.", 2600, ["Logística", "Despacho Aduaneiro", "Receita Federal"]),
]

def calc_read_time(words):
    return max(1, round(words / 200))

def insert_before_marker(lines, marker):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def fix_missing_comma(lines, close_idx):
    entry = lines[close_idx - 1].rstrip("\n")
    if entry.rstrip().endswith("}") and not entry.rstrip().endswith("},"):
        lines[close_idx - 1] = entry.rstrip() + ",\n"
        print("⚠️  Fixed missing comma on last entry before marker")
    return lines

# ════════════════════════════════════════════
# 1. postMeta.ts
# ════════════════════════════════════════════
print("=== 1. Integrating postMeta.ts ===")
meta_path = os.path.join(BASE, "src/data/blog/postMeta.ts")
with open(meta_path) as f:
    meta_lines = f.readlines()

pos = insert_before_marker(meta_lines, "];")
meta_lines = fix_missing_comma(meta_lines, pos)

meta_entries = []
for slug, title, excerpt, words, tags in POSTS:
    rt = calc_read_time(words)
    tags_str = ", ".join(f'"{t}"' for t in tags)
    entry = f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {rt}, tags: [{tags_str}] }}'
    meta_entries.append(entry)

for j, entry in enumerate(meta_entries):
    meta_lines.insert(pos + j, entry + ",\n")

with open(meta_path, "w") as f:
    f.writelines(meta_lines)
meta_count = sum(1 for l in meta_lines if 'slug:' in l)
print(f"  postMeta now has {meta_count} slug lines")

# ════════════════════════════════════════════
# 2. postContentMap.ts
# ════════════════════════════════════════════
print("=== 2. Integrating postContentMap.ts ===")
map_path = os.path.join(BASE, "src/data/blog/postContentMap.ts")
with open(map_path) as f:
    map_lines = f.readlines()

# Find the }; that closes the map (not the one inside interface etc)
# Strategy: find last }; that has getPostContent within next 4 lines
close_map = None
for i in range(len(map_lines) - 1, -1, -1):
    if map_lines[i].strip() == "};":
        for j in range(i + 1, min(i + 5, len(map_lines))):
            if "getPostContent" in map_lines[j]:
                close_map = i
                break
        if close_map is not None:
            break

if close_map is None:
    print("ERROR: Could not find contentMap closing };")
    sys.exit(1)

map_lines = fix_missing_comma(map_lines, close_map)

for slug, _, _, _, _ in POSTS:
    map_lines.insert(close_map, f'  "{slug}": () => import("./content/{slug}"),\n')
    close_map += 1

with open(map_path, "w") as f:
    f.writelines(map_lines)

# Clean trailing backslash artifacts
map_content = open(map_path).read()
if ', \\\\\\n' in map_content:
    map_content = map_content.replace(', \\\\\\n', ',\n')
    open(map_path, 'w').write(map_content)
    print("  Cleaned trailing backslashes")

map_count = sum(1 for l in open(map_path) if '=> import' in l)
gpc_count = sum(1 for l in open(map_path) if 'getPostContent' in l)
print(f"  contentMap now has {map_count} map entries, getPostContent refs: {gpc_count}")

# ════════════════════════════════════════════
# 3. prerender.mjs BLOG_POSTS
# ════════════════════════════════════════════
print("=== 3. Integrating prerender.mjs ===")
pre_path = os.path.join(BASE, "scripts/prerender.mjs")
with open(pre_path) as f:
    pre_lines = f.readlines()

# Find last ]; in file (BLOG_POSTS closing)
pre_end = None
for i in range(len(pre_lines) - 1, -1, -1):
    if pre_lines[i].strip() == "];":
        pre_end = i
        break

if pre_end is None:
    print("ERROR: Could not find '];' in prerender.mjs")
    sys.exit(1)

pre_lines = fix_missing_comma(pre_lines, pre_end)

for slug, title, excerpt, _, _ in POSTS:
    name = title if len(title) <= 70 else title[:67] + "..."
    safe_excerpt = excerpt[:155].replace('"', "'")
    pre_lines.insert(pre_end, f'  {{ slug: "{slug}", name: "{name}", desc: "{safe_excerpt}" }},\n')
    pre_end += 1

with open(pre_path, "w") as f:
    f.writelines(pre_lines)

pre_count = sum(1 for line in open(pre_path) if re.match(r'\s*\{ slug:', line))
print(f"  prerender BLOG_POSTS updated: {pre_count} entries")

# ════════════════════════════════════════════
# Final verification
# ════════════════════════════════════════════
print("\n=== Final Verification ===")
meta_final = sum(1 for l in open(meta_path) if 'slug:' in l and 'interface' not in l.lower())
# Better: grep for slug: " pattern
import subprocess
meta_slugs = set()
for l in open(meta_path):
    m = re.search(r'slug:\s*"([^"]+)"', l)
    if m:
        meta_slugs.add(m.group(1))

content_files = set(f.replace('.ts', '') for f in os.listdir(os.path.join(BASE, 'src/data/blog/content')) if f.endswith('.ts'))

map_slugs = set()
for l in open(map_path):
    m = re.search(r'"([^"]+)":\s*\(\)\s*=>\s*import', l)
    if m:
        map_slugs.add(m.group(1))

print(f"  postMeta slugs: {len(meta_slugs)}")
print(f"  content/ files: {len(content_files)}")
print(f"  contentMap slugs: {len(map_slugs)}")
print(f"  Meta == Map: {meta_slugs == map_slugs}")
print(f"  Missing from meta: {content_files - meta_slugs}")
print(f"  Missing from map: {meta_slugs - map_slugs}")
print("=== Integration Complete ===")
