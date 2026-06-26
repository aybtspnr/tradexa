#!/usr/bin/env python3
"""Integration script for 30 new TRADEXA blog posts (June 25 2026, 21:00).
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs (project-clean).
Line-specific marker insertion — no rfind +1 bugs."""

import os
import re
import sys

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-25"

# ── POST DATA: (slug, title, excerpt, word_count, [tags]) ──
POSTS = [
    ("barreiras-tecnicas-comercio-exterior-como-superar", "Barreiras Técnicas no Comércio Exterior: Como Identificar e Superar", "Guia completo sobre barreiras técnicas (TBT) no comércio exterior brasileiro: como identificar, superar certificações INMETRO ANVISA MAPA FCC CE e regulamentações técnicas nos principais mercados.", 4420, ["Exportação", "Barreiras Comerciais", "Certificações", "Comércio Exterior"]),
    ("drawback-regime-especial-exportacao-completo", "Drawback: Guia Completo do Regime Especial de Exportação", "Guia completo sobre o regime aduaneiro drawback: modalidades suspensão isenção restituição, ato concessório Siscomex, industrialização e vantagens para exportadores brasileiros.", 4943, ["Drawback", "Exportação", "Regimes Aduaneiros", "Tributação"]),
    ("zonas-processamento-exportacao-zpe-guia", "Zonas de Processamento de Exportação (ZPE): Guia Completo", "Guia completo sobre ZPEs no Brasil: benefícios fiscais, localização Pecém Açu, processo de habilitação, vantagens para exportadores e comparação com Zona Franca de Manaus.", 5160, ["Exportação", "ZPE", "Incentivos Fiscais", "Comércio Exterior"]),
    ("certificacao-organica-exportacao-brasil-mercados", "Certificação Orgânica para Exportação Brasileira: Procedimentos e Mercados", "Guia sobre certificação orgânica para exportadores: IBD Ecocert IMO SisOrg, equivalência internacional UE EUA NOP Japão JAS China, processos e oportunidades.", 5876, ["Exportação", "Certificação Orgânica", "Agronegócio", "Sustentabilidade"]),
    ("financiamento-exportacao-proex-bndes-exim", "Financiamento à Exportação: PROEX, BNDES-EXIM e Linhas de Crédito", "Guia completo sobre linhas de financiamento à exportação no Brasil: PROEX equalização pagamento, BNDES-EXIM, ACC ACE e como escolher a melhor opção para seu negócio.", 3747, ["Exportação", "Financiamento", "Crédito", "Comércio Exterior"]),
    ("comercio-eletronico-transfronteirico-b2b-oportunidades", "Comércio Eletrônico Transfronteiriço B2B: Plataformas e Estratégias", "Guia sobre cross-border e-commerce B2B para exportadores brasileiros: Alibaba Amazon Business Global Sources, logística pagamentos marketing digital e oportunidades.", 3623, ["Exportação", "E-commerce", "B2B", "Marketing Digital"]),
    ("credit-documentario-carta-credito-guia", "Crédito Documentário (Carta de Crédito): Guia Prático", "Guia completo sobre carta de crédito LC no comércio exterior: tipos UCP 600 fluxo operacional documentos exigidos custos e como evitar discrepâncias documentais.", 5458, ["Importação", "Exportação", "Pagamentos Internacionais", "Financiamento"]),
    ("contratos-compra-venda-internacional-mercadorias", "Contratos Internacionais de Compra e Venda: Cláusulas Essenciais", "Guia sobre contratos internacionais de compra e venda: CISG lei aplicável cláusulas essenciais Incoterms garantias arbitragem e checklist para revisão contratual.", 4321, ["Importação", "Exportação", "Contratos", "Jurídico"]),
    ("carreiras-comercio-exterior-profissional-guia", "Carreiras em Comércio Exterior: Guia Completo de Profissões", "Guia completo sobre carreiras em comex no Brasil: profissões salários certificações habilidades regiões com oportunidades e tendências do mercado de trabalho.", 4648, ["Carreira", "Comex", "Profissional", "Mercado de Trabalho"]),
    ("simplificacao-aduaneira-oea-programas", "Simplificação Aduaneira no Brasil: OEA e Programas", "Guia sobre programas de simplificação aduaneira: OEA operador econômico autorizado modalidades benefícios certificação Embarcador Autorizado Linha Azul e Portal Único.", 3667, ["Importação", "Exportação", "Despacho Aduaneiro", "OEA"]),
    ("beneficios-fiscais-exportacao-regimes-especiais", "Benefícios Fiscais na Exportação: Reintegra e Regimes Especiais", "Guia completo sobre benefícios fiscais na exportação: Reintegra drawback RECOF REPETRO REPORTO Suframa regimes especiais e planejamento tributário.", 4248, ["Exportação", "Tributação", "Benefícios Fiscais", "Regimes Especiais"]),
    ("importacao-pessoa-fisica-procedimentos-limites", "Importação por Pessoa Física: Regras, Limites e Procedimentos", "Guia completo sobre importação por pessoa física no Brasil: limites de valor tributação remessa postal courier bagagem produtos proibidos e dicas práticas.", 4728, ["Importação", "Pessoa Física", "Tributação", "E-commerce"]),
    ("sonegacao-fiscal-aduaneira-combate-receita-federal", "Combate à Sonegação Fiscal Aduaneira: Controles e Penalidades", "Guia sobre combate à sonegação no comex: subfaturamento fraude documental parametrização canal cinza multas perdimento e boas práticas de compliance aduaneiro.", 3393, ["Tributação", "Compliance", "Receita Federal", "Importação"]),
    ("defesa-comercial-antidumping-salvaguardas-brasil", "Defesa Comercial: Antidumping, Compensatórias e Salvaguardas", "Guia sobre medidas de defesa comercial no Brasil: dumping processo antidumping DECOM medidas compensatórias salvaguardas e casos emblemáticos.", 3358, ["Importação", "Exportação", "Defesa Comercial", "Antidumping"]),
    ("big-data-inteligencia-comercial-comex", "Big Data e Analytics para Inteligência Comercial no Comex", "Guia sobre uso de big data e analytics no comércio exterior: fontes de dados Siscomex BI machine learning trade intelligence e indicadores de mercado.", 3317, ["Inteligência de Mercado", "Big Data", "Analytics", "Comércio Exterior"]),
    ("portos-inteligentes-digitalizacao-portuaria", "Portos Inteligentes (Smart Ports): Digitalização Portuária", "Guia sobre digitalização portuária e smart ports: IoT automação IA blockchain portos brasileiros Porto Sem Papel e tendências globais.", 3711, ["Logística", "Portos", "Tecnologia", "Inovação"]),
    ("criptomoedas-pagamentos-internacionais-comex", "Criptomoedas e Pagamentos Internacionais no Comércio Exterior", "Guia sobre uso de criptomoedas em pagamentos internacionais: Bitcoin stablecoins regulação no Brasil blockchain trade finance e perspectivas futuras.", 3654, ["Tecnologia", "Criptomoedas", "Pagamentos", "Câmbio"]),
    ("cold-chain-logistica-cadeia-frio-internacional", "Logística de Cadeia do Frio: Transporte Internacional de Perecíveis", "Guia sobre cold chain no comércio exterior: contêineres reefer regulamentações ANVISA MAPA FDA monitoramento IoT portos brasileiros e melhores práticas.", 4264, ["Logística", "Cadeia do Frio", "Transporte", "Exportação"]),
    ("linkedin-exportadores-captacao-clientes-internacionais", "LinkedIn para Exportadores: Captação de Clientes Internacionais", "Guia sobre uso do LinkedIn para prospecção internacional: perfil Sales Navigator conteúdo B2B InMail networking global e casos de sucesso.", 4111, ["Marketing Digital", "LinkedIn", "Exportação", "B2B"]),
    ("diversificacao-exportacao-novos-mercados", "Diversificação de Mercados para Exportação: Novos Destinos", "Guia sobre estratégia de diversificação de mercados: critérios de seleção pesquisa internacional estratégias de entrada programas de apoio e redução de riscos.", 4083, ["Exportação", "Estratégia", "Mercados Internacionais", "Inteligência"]),
    ("programa-qualificacao-exportador-apex-sebrae", "Programas de Qualificação para Exportadores: APEX e SEBRAE", "Guia sobre programas de apoio à exportação: APEX-Brasil SEBRAE Comex Program CIN projetos setoriais rodadas de negócios e capacitação exportadora.", 4578, ["Exportação", "APEX", "SEBRAE", "Capacitação"]),
    ("conformidade-regulatoria-lgpd-compliance-internacional", "Conformidade Regulatória no Comércio Exterior: LGPD e Compliance", "Guia sobre compliance no comex: Lei Anticorrupção LGPD FCPA due diligence PLD KYC ISO 37001 e programa de integridade para exportadores.", 4719, ["Compliance", "LGPD", "Regulatório", "Exportação"]),
    ("biocombustiveis-brasil-exportacao-etanol-biodiesel", "Exportação de Biocombustíveis: Etanol Biodiesel e Novas Rotas", "Guia sobre exportação de biocombustíveis brasileiros: etanol biodiesel SAF RenovaBio certificações mercados internacionais e logística dedicada.", 3599, ["Exportação", "Biocombustíveis", "Energia", "Sustentabilidade"]),
    ("industria-defesa-seguranca-exportacao-brasil", "Indústria de Defesa e Segurança: Oportunidades de Exportação", "Guia sobre exportação de produtos de defesa brasileiros: Embraer Taurus IMBEL licenciamento PRODE mercados compradores feiras e compliance internacional.", 3858, ["Exportação", "Defesa", "Segurança", "Indústria"]),
    ("feiras-internacionais-exportadores-participacao", "Feiras Internacionais: Guia para Exportadores Brasileiros", "Guia completo sobre participação em feiras internacionais: principais feiras por setor preparação custeio APEX follow-up métricas de ROI e cases de sucesso.", 3227, ["Exportação", "Feiras", "Marketing", "Negócios Internacionais"]),
    ("due-diligence-fornecedores-internacionais-praticas", "Due Diligence em Fornecedores Internacionais: Práticas e Checklist", "Guia sobre due diligence de fornecedores internacionais: verificação sanções OFAC background check análise financeira visita técnica e checklist completo.", 3008, ["Importação", "Fornecedores", "Compliance", "Due Diligence"]),
    ("corretagem-comissao-agenciamento-comex", "Corretagem, Comissão e Agenciamento no Comércio Exterior", "Guia sobre corretagem e agenciamento no comex: agente de carga trading company comissão contratos internacionais tributação de remessas e registro profissional.", 4548, ["Importação", "Exportação", "Agente de Carga", "Corretagem"]),
    ("garantias-contratuais-comex-performance-bond", "Garantias Contratuais no Comércio Exterior: Bid Bond e Performance Bond", "Guia sobre garantias contratuais internacionais: bid bond performance bond standby LC URDG 758 seguro garantia execução de garantia e custos.", 4286, ["Exportação", "Garantias", "Contratos", "Financiamento"]),
    ("deposito-alfandegado-custodia-mercadorias", "Depósito Alfandegado: Custódia de Mercadorias e Funcionamento", "Guia sobre depósito alfandegado: tipos prazos custos documentação regimes especiais responsabilidade do depositário leilão de mercadorias e procedimentos.", 5121, ["Importação", "Logística", "Armazenagem", "Despacho Aduaneiro"]),
    ("entreposto-industrial-subcontratacao-exportacao", "Entreposto Industrial e Subcontratação na Exportação", "Guia sobre entreposto industrial: industrialização sob controle aduaneiro subcontratação RECOF suspensão tributária fluxo operacional e cases práticos.", 4406, ["Exportação", "Regimes Aduaneiros", "Indústria", "Entreposto"]),
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
if ', \\\\\\\n' in map_content:
    map_content = map_content.replace(', \\\\\\\n', ',\n')
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

# Check for content field in postMeta (code-split format)
content_fields = sum(1 for l in open(meta_path) if 'content:' in l and 'import' in l)
print(f"  content fields with import: {content_fields} (should be 0)")
print("=== Integration Complete ===")
