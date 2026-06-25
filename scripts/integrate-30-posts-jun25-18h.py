#!/usr/bin/env python3
"""Integration script for 30 new TRADEXA blog posts (June 25 2026, 18:00).
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs (project-clean).
Line-specific marker insertion — no rfind +1 bugs."""

import os
import re
import sys

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-25"

# ── POST DATA: (slug, title, excerpt, word_count, [tags]) ──
POSTS = [
    ("garantias-contratuais-comex-bid-bond-performance-bond", "Garantias Contratuais no Comércio Exterior: Bid Bond, Performance Bond e Garantia de Execução", "Guia completo sobre garantias contratuais no comex: bid bond em licitações internacionais, performance bond para contratos de exportação, standby letter of credit, garantia bancária vs seguro garantia, custos e prazos.", 3365, ["Contratos", "Garantias", "Exportação", "Financiamento"]),
    ("risco-cambial-hedge-importador-exportador", "Risco Cambial no Comércio Exterior: Hedge, Estratégias e Ferramentas de Proteção", "Guia completo sobre risco cambial no comex: hedge via NDF, contrato de câmbio a termo, opções de moeda, natural hedge, impacto do IOF e estratégias para importadores e exportadores.", 3955, ["Câmbio", "Finanças", "Importação", "Exportação"]),
    ("seguranca-cibernetica-cadeia-suprimentos-internacional", "Segurança Cibernética na Cadeia de Suprimentos Internacional: Riscos e Boas Práticas", "Guia completo sobre segurança cibernética na cadeia logística internacional: ataques a portos, ransomware, proteção de dados, LGPD, ISO 27001 e seguros cibernéticos para operadores logísticos.", 3028, ["Tecnologia", "Logística", "Segurança", "Compliance"]),
    ("responsabilidade-civil-transportador-convencoes", "Responsabilidade Civil do Transportador Internacional: Convenções, Limites e Seguros", "Guia completo sobre responsabilidade civil do transportador: Convenção de Bruxelas, Haia-Visby, Montreal, CMR e COTIF/CIM, limites de indenização e prazos para reclamação.", 3674, ["Logística", "Transporte", "Seguros", "Regulamentação"]),
    ("prevencao-fraudes-comex-boas-praticas", "Prevenção a Fraudes no Comércio Exterior: Golpes Comuns e Boas Práticas de Segurança", "Guia completo sobre prevenção a fraudes no comex: golpes comuns, due diligence em parceiros, verificação RADAR/Siscomex, cartas de crédito confirmadas e plataformas de verificação.", 3741, ["Compliance", "Segurança", "Importação", "Exportação"]),
    ("social-commerce-exportacao-linkedin-instagram", "Social Commerce na Exportação: LinkedIn e Instagram para Vendas B2B Internacionais", "Guia completo sobre social selling B2B para exportadores: LinkedIn e Instagram, geração de leads qualificados, conteúdo estratégico e anúncios segmentados por país.", 3503, ["Exportação", "Marketing", "Tecnologia", "Vendas"]),
    ("transformacao-digital-processos-comex", "Transformação Digital nos Processos de Comércio Exterior: Tecnologias e Benefícios", "Guia completo sobre transformação digital no comex: Portal Único Siscomex 4.0, blockchain, IoT, automatização de classificação NCM e integração de sistemas ERP.", 2873, ["Tecnologia", "Inovação", "Siscomex", "Comex"]),
    ("inteligencia-artificial-classificacao-ncm-comex", "Inteligência Artificial na Classificação NCM e no Comércio Exterior: Guia Completo", "Guia completo sobre IA na classificação NCM: machine learning, NLP em documentos, automação de despacho aduaneiro, análise preditiva de barreiras tarifárias e chatbots aduaneiros.", 2755, ["Tecnologia", "NCM", "Inovação", "Classificação Fiscal"]),
    ("ecommerce-cross-border-modelos-logistica", "E-commerce Cross-Border no Brasil: Modelos de Negócio, Tributação e Logística", "Guia completo sobre e-commerce cross-border: dropshipping, marketplace, Remessa Conforme, logística last mile, meios de pagamento transfronteiriços e plataformas de marketplace.", 2771, ["E-commerce", "Importação", "Logística", "Tecnologia"]),
    ("mei-microempresa-comex-exportar-importar", "MEI e Microempresa no Comércio Exterior: Como Exportar e Importar Legalmente", "Guia completo para MEI e microempresas no comex: limites de faturamento, Exporta Fácil, RADAR Siscomex, regimes tributários e oportunidades no mercado internacional.", 3045, ["Exportação", "Importação", "PME", "Simples Nacional"]),
    ("consorcios-exportacao-associativismo-pmes", "Consórcios de Exportação e Associativismo: Estratégias para PMEs Brasileiras", "Guia completo sobre consórcios de exportação: modelos, APEX-Brasil, cases de sucesso, vantagens para PMEs e como formar um consórcio de exportação.", 3479, ["Exportação", "Associativismo", "PME", "APEX-Brasil"]),
    ("startup-comex-inovacao-oportunidades", "Startups no Comércio Exterior: Inovação, Tecnologia e Oportunidades de Negócio", "Guia completo sobre startups de comex: fintechs de câmbio, logtechs, trade techs, marketplaces B2B, venture capital e tendências de inovação no setor.", 3139, ["Tecnologia", "Inovação", "Startups", "Finanças"]),
    ("associativismo-exportacao-resultados", "Associativismo na Exportação: Cases de Sucesso e Resultados para PMEs Brasileiras", "Guia completo sobre associativismo exportador: cases Wines of Brasil, Brazilian Gourmet Coffees, Brazilian Fashion, métricas de sucesso e ganhos de escala para PMEs.", 3333, ["Exportação", "Associativismo", "PME", "APEX-Brasil"]),
    ("programa-exporta-facil-pmes", "Exporta Fácil dos Correios: Guia Completo para PMEs Exportarem pelo Correio", "Guia completo do Exporta Fácil: como funciona, limites de peso e valor, documentação, rastreamento, prazos, custos e passo a passo para primeira exportação.", 4419, ["Exportação", "PME", "Logística", "Correios"]),
    ("dragagem-portuaria-brasil-desafios", "Dragagem Portuária no Brasil: Desafios, Investimentos e Impacto no Comércio Exterior", "Guia completo sobre dragagem portuária no Brasil: portos, licenciamento ambiental, investimentos do PAC, calado e impacto na competitividade das exportações.", 3175, ["Portos", "Infraestrutura", "Logística", "Investimento"]),
    ("terminais-portuarios-privatizados-brasil", "Terminais Portuários Privatizados no Brasil: Arrendamentos, Concessões e Oportunidades", "Guia completo sobre terminais portuários privatizados: Lei dos Portos, TUPs, arrendamentos, concessões e investimentos privados na infraestrutura portuária.", 3155, ["Portos", "Infraestrutura", "Logística", "Investimento"]),
    ("navegacao-interior-hidrovias-brasil-logistica", "Navegação Interior e Hidrovias na Logística Brasileira: Rotas, Desafios e Oportunidades", "Guia completo sobre navegação interior e hidrovias brasileiras: Tietê-Paraná, Madeira, São Francisco, Araguaia-Tocantins, vantagens e gargalos do transporte hidroviário.", 3707, ["Logística", "Transporte", "Hidrovias", "Infraestrutura"]),
    ("esg-cadeia-fornecedores-internacional", "ESG na Cadeia de Fornecedores Internacional: Critérios, Compliance e Oportunidades", "Guia completo sobre ESG na cadeia de fornecedores internacional: due diligence, EUDR, GRI, SASB, carbono neutro e certificações para empresas brasileiras.", 3270, ["Sustentabilidade", "ESG", "Compliance", "Exportação"]),
    ("comercio-justo-fair-trade-oportunidades", "Comércio Justo e Fair Trade no Brasil: Oportunidades, Certificações e Mercados", "Guia completo sobre comércio justo e Fair Trade no Brasil: certificações, produtos certificados, mercado europeu, WFTO e oportunidades para produtores brasileiros.", 3651, ["Sustentabilidade", "Certificações", "Exportação", "Agronegócio"]),
    ("logistica-verde-transporte-sustentavel", "Logística Verde e Transporte Sustentável no Comércio Exterior: Guia Completo", "Guia completo sobre logística verde no comex: redução de emissões IMO 2030/2050, combustíveis alternativos, economia circular, créditos de carbono e certificações.", 4182, ["Sustentabilidade", "Logística", "Transporte", "Inovação"]),
    ("rastreabilidade-producao-cadeia-comex", "Rastreabilidade na Cadeia de Produção do Comércio Exterior: Sistemas, Tecnologias e Regulamentações", "Guia completo sobre rastreabilidade no comex: blockchain, EUDR, IoT na cadeia do frio, QR Code, e sistemas de geolocalização para exportações brasileiras.", 4011, ["Sustentabilidade", "Tecnologia", "Exportação", "Agronegócio"]),
    ("reexportacao-brasil-procedimentos-aduaneiros", "Reexportação no Brasil: Procedimentos Aduaneiros, Regimes e Oportunidades", "Guia completo sobre reexportação: procedimentos aduaneiros, drawback, entreposto, admissão temporária e aspectos tributários no Siscomex.", 3851, ["Regimes Aduaneiros", "Exportação", "Drawback", "Siscomex"]),
    ("importacao-temporaria-regime-aduaneiro", "Importação Temporária: Regime Aduaneiro Especial, Procedimentos e Garantias", "Guia completo sobre importação temporária: regimes de suspensão, garantias, prazos, processos no Siscomex e análise financeira de viabilidade do regime.", 3771, ["Regimes Aduaneiros", "Importação", "Despacho Aduaneiro", "Siscomex"]),
    ("admissao-temporaria-exportacao-reesportacao", "Admissão Temporária na Exportação: Como Utilizar o Regime para Feiras e Demonstrações", "Guia completo sobre admissão temporária na exportação: Carnê ATA, Convenção de Istambul, amostras, feiras internacionais e procedimentos na Receita Federal.", 3552, ["Regimes Aduaneiros", "Exportação", "Feiras", "Documentação"]),
    ("entreposto-aduaneiro-funcionamento-beneficios", "Entrepôsto Aduaneiro: Funcionamento, Benefícios e Como Utilizar no Comex", "Guia completo sobre entreposto aduaneiro: armazenagem com suspensão tributária, prazos, recintos habilitados e diferenças entre entreposto e EADI.", 2585, ["Regimes Aduaneiros", "Logística", "Armazenagem", "Drawback"]),
    ("investimento-direto-estrangeiro-brasil-regras", "Investimento Direto Estrangeiro no Brasil: Regras, Setores e Oportunidades para 2026", "Guia completo sobre IDE no Brasil: registro RDE-IED, setores com restrições, tributação, acordos de bitributação e programas de incentivo.", 2640, ["Investimento", "Finanças", "Regulamentação", "Compliance"]),
    ("arbitragem-internacional-contratos-comerciais", "Arbitragem Internacional em Contratos Comerciais: Guia para Exportadores e Importadores", "Guia completo sobre arbitragem internacional: câmaras arbitrais, cláusula compromissória, Convenção de Nova York e execução de sentenças arbitrais.", 3699, ["Contratos", "Arbitragem", "Exportação", "Importação"]),
    ("propriedade-intelectual-comex-patentes-marcas", "Propriedade Intelectual no Comércio Exterior: Patentes, Marcas e Proteção Internacional", "Guia completo sobre propriedade intelectual no comex: PCT, Sistema de Madri, INPI, contrafação e medidas de fronteira da Receita Federal.", 3641, ["Propriedade Intelectual", "Contratos", "Exportação", "Importação"]),
    ("leiloes-internacionais-mercadorias-apreendidas", "Leilões Internacionais de Mercadorias: Como Participar e Oportunidades no Comércio Exterior", "Guia completo sobre leilões de mercadorias: Receita Federal, cargas abandonadas em portos, cadastro, tributação e riscos na compra de mercadorias em leilão.", 3397, ["Importação", "Logística", "Compras", "Receita Federal"]),
    ("marketing-digital-exportacao-estrategias-canais", "Marketing Digital para Exportação: Estratégias, Canais e Ferramentas para Alcançar Compradores Globais", "Guia completo sobre marketing digital para exportação: SEO internacional, Google Ads, LinkedIn Ads, inbound marketing e marketplaces B2B para exportadores.", 3115, ["Exportação", "Marketing", "Tecnologia", "Vendas"]),
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
if ', \\\\\n' in map_content:
    map_content = map_content.replace(', \\\\\n', ',\n')
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
