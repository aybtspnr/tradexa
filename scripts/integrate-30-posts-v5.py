#!/usr/bin/env python3
"""Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion (no regex-on-content) to avoid known pitfalls."""
import re, os, math

DATE = "2026-06-29"
CONTENT_DIR = "src/data/blog/content"
POSTMETA = "src/data/blog/postMeta.ts"
CONTENTMAP = "src/data/blog/postContentMap.ts"
PRERENDER = "scripts/prerender.mjs"

# Our 30 new slugs
NEW_SLUGS = [
    "seguro-carga-internacional",
    "seguro-maritimo",
    "avaria-grossa",
    "seguro-transporte-rodoviario-internacional",
    "seguro-aereo-carga",
    "iso-22000-seguranca-alimentos-comex",
    "iso-27001-seguranca-informacao-comex",
    "iso-45001-saude-seguranca-trabalho-comex",
    "iso-50001-gestao-energia-comex",
    "pegada-hidrica-exportacao-brasil-sustentabilidade",
    "comercio-brasil-siria-oportunidades",
    "comercio-brasil-mauritania-pesca-mineracao",
    "comercio-brasil-seicheles-turismo",
    "comercio-brasil-malawi-agricultura",
    "comercio-brasil-djibuti-logistica",
    "frutas-exoticas-brasil-acai-cupuacu-exportacao",
    "especiarias-brasileiras-exportacao-mercados",
    "castanha-para-caju-brasil-exportacao-mercados",
    "agua-mineral-exportacao-brasil-mercados",
    "flores-plantas-ornamentais-exportacao-brasil",
    "pet-shop-produtos-animais-exportacao-brasil",
    "cafe-especialty-exportacao-brasil-mercados",
    "picking-packing-armazenagem-comex-logistica",
    "contrato-frete-internacional-transporte-carga",
    "greenwashing-comex-sustentabilidade-cuidados",
    "contencioso-tributario-aduaneiro-estrategias",
    "thin-capitalization-juros-capital-proprio-comex",
    "relatorio-sustentabilidade-esg-exportadores",
    "exportacao-caprinos-ovinos-brasil-mercados",
    "inspecao-qualidade-fornecedores-internacionais",
]

# Title map (from our plan)
TITLES = {
    "seguro-carga-internacional": "Seguro de Carga Internacional no Comex: Modalidades, Coberturas e Procedimentos",
    "seguro-maritimo": "Seguro Marítimo no Transporte Internacional: Guia Completo para Importadores e Exportadores",
    "avaria-grossa": "Avaria Grossa no Transporte Marítimo: Como Funciona, Custos e Como se Proteger",
    "seguro-transporte-rodoviario-internacional": "Seguro de Transporte Rodoviário Internacional: Coberturas e Procedimentos no Comex",
    "seguro-aereo-carga": "Seguro Aéreo de Carga no Comércio Exterior: Coberturas, Custos e Procedimentos",
    "iso-22000-seguranca-alimentos-comex": "ISO 22000: Sistema de Gestão de Segurança de Alimentos na Exportação Brasileira",
    "iso-27001-seguranca-informacao-comex": "ISO 27001: Segurança da Informação na Gestão de Comércio Exterior",
    "iso-45001-saude-seguranca-trabalho-comex": "ISO 45001: Saúde e Segurança Ocupacional no Setor de Comércio Exterior",
    "iso-50001-gestao-energia-comex": "ISO 50001: Gestão de Energia na Indústria Exportadora Brasileira",
    "pegada-hidrica-exportacao-brasil-sustentabilidade": "Pegada Hídrica na Exportação Brasileira: Sustentabilidade e Competitividade Internacional",
    "comercio-brasil-siria-oportunidades": "Comércio Brasil-Síria: Perspectivas, Oportunidades e Desafios",
    "comercio-brasil-mauritania-pesca-mineracao": "Comércio Brasil-Mauritânia: Pesca, Mineração e Oportunidades na África Ocidental",
    "comercio-brasil-seicheles-turismo": "Comércio Brasil-Seychelles: Turismo, Comércio e Oportunidades no Oceano Índico",
    "comercio-brasil-malawi-agricultura": "Comércio Brasil-Malawi: Agricultura, Energia e Oportunidades na África Austral",
    "comercio-brasil-djibuti-logistica": "Comércio Brasil-Djibuti: Hub Logístico no Chifre da África e Oportunidades",
    "frutas-exoticas-brasil-acai-cupuacu-exportacao": "Exportação de Frutas Exóticas Brasileiras: Açaí, Cupuaçu, Bacuri e o Mercado Global",
    "especiarias-brasileiras-exportacao-mercados": "Exportação de Especiarias Brasileiras: Pimenta-do-Reino, Cravo, Canela e o Mercado Global",
    "castanha-para-caju-brasil-exportacao-mercados": "Exportação de Castanhas Brasileiras: Castanha-do-Pará, Castanha de Caju e Mercados Globais",
    "agua-mineral-exportacao-brasil-mercados": "Exportação de Água Mineral Brasileira: Oportunidades, Regulamentação e Mercados",
    "flores-plantas-ornamentais-exportacao-brasil": "Exportação de Flores e Plantas Ornamentais Brasileiras: Mercados e Oportunidades",
    "pet-shop-produtos-animais-exportacao-brasil": "Exportação de Produtos Pet Shop: Alimentos, Acessórios e o Mercado Global",
    "cafe-especialty-exportacao-brasil-mercados": "Exportação de Café Especial Brasileiro: Specialty Coffee e o Mercado Global",
    "picking-packing-armazenagem-comex-logistica": "Picking e Packing na Logística de Comércio Exterior: Eficiência e Organização",
    "contrato-frete-internacional-transporte-carga": "Contrato de Frete Internacional: Cláusulas Essenciais e Negociação no Transporte de Carga",
    "greenwashing-comex-sustentabilidade-cuidados": "Greenwashing no Comércio Exterior: Como Identificar e Evitar Práticas Enganosas",
    "contencioso-tributario-aduaneiro-estrategias": "Contencioso Tributário Aduaneiro: Estratégias para Empresas de Comércio Exterior",
    "thin-capitalization-juros-capital-proprio-comex": "Thin Capitalization no Comércio Exterior: Juros sobre Capital Próprio e Limites",
    "relatorio-sustentabilidade-esg-exportadores": "Relatório de Sustentabilidade e ESG para Exportadores Brasileiros: Guia Completo",
    "exportacao-caprinos-ovinos-brasil-mercados": "Exportação de Caprinos e Ovinos do Brasil: Mercados, Genética e Carne",
    "inspecao-qualidade-fornecedores-internacionais": "Inspeção de Qualidade em Fornecedores Internacionais: Como Garantir Conformidade na Importação",
}

# Tags map
TAGS = {
    "seguro-carga-internacional": ["Seguros", "Logística", "Comércio Exterior", "Importação", "Exportação"],
    "seguro-maritimo": ["Seguros", "Logística", "Comércio Exterior", "Transporte Marítimo"],
    "avaria-grossa": ["Seguros", "Logística", "Comércio Exterior", "Transporte Marítimo"],
    "seguro-transporte-rodoviario-internacional": ["Seguros", "Logística", "Comércio Exterior", "Transporte Rodoviário"],
    "seguro-aereo-carga": ["Seguros", "Logística", "Comércio Exterior", "Transporte Aéreo"],
    "iso-22000-seguranca-alimentos-comex": ["Certificações", "Qualidade", "Segurança Alimentar", "Exportação", "Comércio Exterior"],
    "iso-27001-seguranca-informacao-comex": ["Certificações", "Segurança da Informação", "Tecnologia", "Comércio Exterior", "Compliance"],
    "iso-45001-saude-seguranca-trabalho-comex": ["Certificações", "Saúde Ocupacional", "Segurança do Trabalho", "Comércio Exterior"],
    "iso-50001-gestao-energia-comex": ["Certificações", "Gestão de Energia", "Sustentabilidade", "Exportação", "Comércio Exterior"],
    "pegada-hidrica-exportacao-brasil-sustentabilidade": ["Sustentabilidade", "Pegada Hídrica", "Meio Ambiente", "Exportação", "Comércio Exterior"],
    "comercio-brasil-siria-oportunidades": ["Comércio Exterior", "Síria", "Oriente Médio", "Exportação", "Oportunidades"],
    "comercio-brasil-mauritania-pesca-mineracao": ["Comércio Exterior", "Mauritânia", "África", "Pesca", "Mineração"],
    "comercio-brasil-seicheles-turismo": ["Comércio Exterior", "Seychelles", "África", "Turismo", "Oceano Índico"],
    "comercio-brasil-malawi-agricultura": ["Comércio Exterior", "Malawi", "África", "Agricultura", "Exportação"],
    "comercio-brasil-djibuti-logistica": ["Comércio Exterior", "Djibuti", "África", "Logística", "Hub Portuário"],
    "frutas-exoticas-brasil-acai-cupuacu-exportacao": ["Exportação", "Frutas Exóticas", "Açaí", "Agronegócio", "Comércio Exterior"],
    "especiarias-brasileiras-exportacao-mercados": ["Exportação", "Especiarias", "Agronegócio", "Comércio Exterior", "Alimentos"],
    "castanha-para-caju-brasil-exportacao-mercados": ["Exportação", "Castanhas", "Agronegócio", "Comércio Exterior", "Alimentos"],
    "agua-mineral-exportacao-brasil-mercados": ["Exportação", "Água Mineral", "Comércio Exterior", "Alimentos", "Bebidas"],
    "flores-plantas-ornamentais-exportacao-brasil": ["Exportação", "Flores", "Plantas Ornamentais", "Agronegócio", "Comércio Exterior"],
    "pet-shop-produtos-animais-exportacao-brasil": ["Exportação", "Pet Shop", "Alimentos", "Comércio Exterior", "Animais"],
    "cafe-especialty-exportacao-brasil-mercados": ["Exportação", "Café Especial", "Specialty Coffee", "Agronegócio", "Comércio Exterior"],
    "picking-packing-armazenagem-comex-logistica": ["Logística", "Armazenagem", "Picking", "Packing", "Comércio Exterior"],
    "contrato-frete-internacional-transporte-carga": ["Logística", "Frete Internacional", "Transporte", "Contratos", "Comércio Exterior"],
    "greenwashing-comex-sustentabilidade-cuidados": ["Sustentabilidade", "Greenwashing", "ESG", "Comércio Exterior", "Exportação"],
    "contencioso-tributario-aduaneiro-estrategias": ["Tributação", "Contencioso", "Compliance", "Comércio Exterior", "Importação"],
    "thin-capitalization-juros-capital-proprio-comex": ["Tributação", "Thin Capitalization", "Compliance", "Finanças", "Comércio Exterior"],
    "relatorio-sustentabilidade-esg-exportadores": ["Sustentabilidade", "ESG", "Relatórios", "Exportação", "Comércio Exterior"],
    "exportacao-caprinos-ovinos-brasil-mercados": ["Exportação", "Caprinos", "Ovinos", "Agronegócio", "Comércio Exterior"],
    "inspecao-qualidade-fornecedores-internacionais": ["Qualidade", "Inspeção", "Fornecedores", "Importação", "Comércio Exterior"],
}

def word_count(slug):
    fpath = f"{CONTENT_DIR}/{slug}.ts"
    with open(fpath) as f:
        content = f.read()
    # Extract the content between backticks
    match = re.search(r"content\s*=\s*`(.*?)`\s*;", content, re.DOTALL)
    if match:
        return len(match.group(1).split())
    return 0

def read_time(slug):
    wc = word_count(slug)
    return max(8, round(wc / 200))

def excerpt(slug):
    fpath = f"{CONTENT_DIR}/{slug}.ts"
    with open(fpath) as f:
        content = f.read()
    match = re.search(r"content\s*=\s*`(.*?)`\s*;", content, re.DOTALL)
    if match:
        text = match.group(1)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"##+\s*", "", text)
        text = re.sub(r"\n", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) > 155:
            text = text[:152] + "..."
        return text
    return ""

def build_meta_entry(slug, idx):
    title = TITLES[slug]
    exc = excerpt(slug)
    # Escape quotes in excerpt
    exc = exc.replace('"', '\\"')
    rt = read_time(slug)
    wc = word_count(slug)
    tags_str = ", ".join(f'"{t}"' for t in TAGS[slug])
    return f'  {{ slug: "{slug}", title: "{title}", excerpt: "{exc}", date: "{DATE}", readTime: {rt}, tags: [{tags_str}] }},'

def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'

def build_prerender_entry(slug):
    title = TITLES[slug]
    exc = excerpt(slug)
    exc = exc.replace('"', '\\"')
    if len(exc) > 155:
        exc = exc[:152] + "..."
    return f'  {{ slug: "{slug}", name: "{title}", desc: "{exc}" }},'

def insert_before_marker(lines, marker, direction=-1):
    """Find the LAST occurrence of marker and return its index."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def insert_before_index(lines, entries, target_idx):
    """Insert entries at target_idx (insert before it)."""
    for j, entry in enumerate(entries):
        lines.insert(target_idx + j, entry + "\n")
    return lines

# === STEP 1: Update postMeta.ts ===
print("=" * 60)
print("STEP 1: Updating postMeta.ts")
with open(POSTMETA) as f:
    lines = f.readlines()
close_idx = insert_before_marker(lines, "];")
meta_entries = []
for slug in NEW_SLUGS:
    meta_entries.append(build_meta_entry(slug, 0))
    wc = word_count(slug)
    print(f"  {slug}: {wc} words, rt={read_time(slug)}")
insert_before_index(lines, meta_entries, close_idx)
with open(POSTMETA, "w") as f:
    f.writelines(lines)
print(f"✅ postMeta.ts: +{len(NEW_SLUGS)} entries")

# === STEP 2: Update postContentMap.ts ===
print()
print("=" * 60)
print("STEP 2: Updating postContentMap.ts")
with open(CONTENTMAP) as f:
    lines = f.readlines()
# Find the map's closing }; by looking for a "};" with getPostContent nearby
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        for j in range(i + 1, min(i + 4, len(lines))):
            if "export async function getPostContent" in lines[j]:
                close_map = i
                break
        if close_map is not None:
            break
if close_map is None:
    # Fallback: last };
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "};":
            close_map = i
            break
map_entries = [build_map_entry(slug) for slug in NEW_SLUGS]
insert_before_index(lines, map_entries, close_map)
with open(CONTENTMAP, "w") as f:
    f.writelines(lines)
print(f"✅ postContentMap.ts: +{len(NEW_SLUGS)} entries")

# === STEP 3: Update prerender.mjs ===
print()
print("=" * 60)
print("STEP 3: Updating prerender.mjs BLOG_POSTS")
with open(PRERENDER) as f:
    lines = f.readlines()
blog_end = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        blog_end = i
        break
prerender_entries = [build_prerender_entry(slug) for slug in NEW_SLUGS]
insert_before_index(lines, prerender_entries, blog_end)
with open(PRERENDER, "w") as f:
    f.writelines(lines)
print(f"✅ prerender.mjs: +{len(NEW_SLUGS)} entries")

# === VERIFICATION ===
print()
print("=" * 60)
print("VERIFICATION")
meta_count = sum(1 for line in open(POSTMETA) if line.strip().startswith("{ slug:"))
map_count = sum(1 for line in open(CONTENTMAP) if ": () => import" in line)
prerender_count = sum(1 for line in open(PRERENDER) if re.search(r'slug:\s*"([^"]+)"', line) and "const BLOG_POSTS" not in line and "const PAGES" not in line)
# Actually let's count BLOG_POSTS specifically
import subprocess
result = subprocess.run(["bash", "-c", r"awk '/^const BLOG_POSTS/,/^];/' scripts/prerender.mjs | grep -c 'slug:'"], capture_output=True, text=True)
prerender_blog = result.stdout.strip()
files_count = len([f for f in os.listdir(CONTENT_DIR) if f.endswith(".ts")])

print(f"postMeta.ts:       {meta_count}")
print(f"postContentMap.ts: {map_count}")
print(f"prerender.mjs:     {prerender_blog} (BLOG_POSTS)")
print(f"content/ files:    {files_count}")

no_content = sum(1 for line in open(POSTMETA) if "content:" in line and "import" in line)
print(f"No content fields with import: {'✅' if no_content == 0 else f'❌ {no_content} found'}")

if meta_count == files_count == map_count == int(prerender_blog):
    print("✅ ALL FOUR IN SYNC!")
else:
    print("❌ MISMATCH DETECTED!")
    print(f"   meta={meta_count} files={files_count} map={map_count} prerender={prerender_blog}")
