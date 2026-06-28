#!/usr/bin/env python3
"""Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.

This script uses line-based insertion (no regex-on-content) to avoid all known pitfalls:
- Inserts before the last ]; in postMeta.ts (the array close)
- Inserts before the last }; with getPostContent proximity in postContentMap.ts
- Inserts before the last ]; in prerender.mjs (BLOG_POSTS array close)
"""

import re, os

CONTENT_DIR = "src/data/blog/content"
POSTMETA = "src/data/blog/postMeta.ts"
CONTENTMAP = "src/data/blog/postContentMap.ts"
PRERENDER = "scripts/prerender.mjs"
DATE = "2026-06-28"

# Slug map: slug -> (title_from_file, manual_excerpt)
# We'll extract titles from content files
POSTS_INFO = {}

# Read each content file to extract title
for fname in sorted(os.listdir(CONTENT_DIR)):
    if not fname.endswith(".ts"):
        continue
    slug = fname[:-3]
    # Skip orphans and existing posts (baseline 1521)
    # We want the 30 NEW ones. Let's read all and filter based on our list.
    pass

# Our 30 new slugs
NEW_SLUGS = [
    "exportacao-farmaceuticos-vacinas-brasil-mercados-globais",
    "exportacao-cachaca-bebidas-destiladas-mercados-internacionais",
    "exportacao-biotecnologia-brasil-mercados-oportunidades",
    "importacao-equipamentos-medicos-hospitalares-anvisa-regulacao",
    "importacao-moveis-decoracao-brasil-procedimentos-tributos",
    "exportacao-ovos-avicolas-brasil-mercados-globais",
    "exportacao-carne-suina-brasil-mercados-requisitos",
    "exportacao-laticinios-queijos-leite-mercados-globais",
    "exportacao-frutas-frescas-manga-uva-melao-mercados",
    "licenciamento-importacao-software-brasil-procedimentos",
    "educacao-capacitacao-comex-cursos-formacao-profissional",
    "erp-comex-gestao-importacao-exportacao-software-funcionalidades",
    "comercio-brasil-coreia-sul-eletronicos-tecnologia",
    "comercio-brasil-holanda-logistica-distribuicao-europa",
    "comercio-brasil-australia-mineracao-energia-agricultura",
    "comercio-brasil-colombia-integracao-regional-comercial",
    "comercio-brasil-peru-integracao-comercial-vizinho",
    "comercio-brasil-vietna-asia-sudeste-manufatura-oportunidades",
    "comercio-brasil-angola-cooperacao-lusofonia-negocios",
    "comercio-brasil-nigeria-petroleo-mercado-consumidor",
    "comercio-brasil-emirados-arabes-logistica-oriente-medio",
    "comercio-brasil-tailandia-asia-sudeste-manufatura",
    "transporte-carga-aerea-importacao-exportacao-logistica",
    "conteiner-reefer-refrigerado-logistica-cadeia-frio",
    "carga-perigosa-classificacao-imdg-transporte-maritimo",
    "acordo-mercosul-uniao-europeia-oportunidades-comerciais",
    "turismo-receptivo-internacional-brasil-servicos-cambio",
    "comercio-brasil-republica-tcheca-europa-central-industria",
    "comercio-brasil-polonia-europa-central-oportunidades",
    "comercio-brasil-grecia-europa-mediterraneo-oportunidades",
]

def extract_title_excerpt(filepath):
    """Extract the first ## heading as title and generate an excerpt."""
    with open(filepath, "r") as f:
        content = f.read()
    
    # Extract title: first ## heading line
    title_match = re.search(r'^##\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()
    
    # Clean up title: remove "Guia Completo" or similar suffixes for brevity
    # But keep the main title
    if len(title) > 110:
        title = title[:110]
    
    # Generate excerpt: first ~150 chars of actual content after title
    excerpt = ""
    para_match = re.search(r'^(?!##)[^\n].{50,}', content, re.MULTILINE)
    if para_match:
        excerpt = para_match.group(0).strip()
        excerpt = re.sub(r'[`\n\r]', '', excerpt)
        if len(excerpt) > 155:
            # Cut at last word boundary before 155
            cut = excerpt[:152]
            last_space = cut.rfind(' ')
            excerpt = cut[:last_space] + '...' if last_space > 80 else cut + '...'
        elif len(excerpt) < 100:
            excerpt = excerpt  # Keep as is, short but meaningful
    
    if not excerpt or len(excerpt) < 40:
        action = "acessar" if "import" in slug else "exportar"
        excerpt = f"Guia completo sobre {title.lower()}. Saiba como {action} com sucesso utilizando as ferramentas TRADEXA."
        if len(excerpt) > 155:
            excerpt = excerpt[:152] + "..."
    
    return title, excerpt

def get_tags(slug):
    """Assign tags based on slug content."""
    tags = ["Comércio Exterior"]
    
    if "exportacao" in slug or "exportar" in slug:
        tags.append("Exportação")
    if "importacao" in slug or "importar" in slug:
        tags.append("Importação")
    if "comercio" in slug:
        tags.append("Comércio Exterior")
    
    # Country tags
    country_map = {
        "coreia": ["Coreia do Sul", "Ásia", "Tecnologia"],
        "holanda": ["Holanda", "Europa", "Logística"],
        "australia": ["Austrália", "Oceania", "Mineração"],
        "colombia": ["Colômbia", "América do Sul"],
        "angola": ["Angola", "África", "Lusofonia"],
        "nigeria": ["Nigéria", "África", "Petróleo"],
        "emirados": ["Emirados Árabes", "Oriente Médio", "Logística"],
        "tailandia": ["Tailândia", "Ásia", "Indústria Automotiva"],
        "peru": ["Peru", "América do Sul"],
        "vietna": ["Vietnã", "Ásia", "Sudeste Asiático"],
        "republica-tcheca": ["República Tcheca", "Europa Central"],
        "polonia": ["Polônia", "Europa Central"],
        "grecia": ["Grécia", "Europa", "Mediterrâneo"],
    }
    for key, ctags in country_map.items():
        if key in slug:
            tags.extend(ctags)
    
    # Topic tags
    if "farmaceutico" in slug or "vacina" in slug:
        tags.extend(["Farmacêutico", "ANVISA", "Saúde"])
    if "cachaca" in slug or "bebida" in slug:
        tags.extend(["Bebidas", "Cachaça", "Alimentos e Bebidas"])
    if "biotecnologia" in slug:
        tags.extend(["Biotecnologia", "Inovação", "Tecnologia"])
    if "equipamentos-medicos" in slug or "hospitalar" in slug:
        tags.extend(["Equipamentos Médicos", "ANVISA", "Saúde"])
    if "moveis" in slug or "decoracao" in slug or "móveis" in slug:
        tags.extend(["Móveis", "Decoração", "NCM"])
    if "ovos" in slug or "avicola" in slug:
        tags.extend(["Ovos", "Avicultura", "MAPA", "Agronegócio"])
    if "carne-suina" in slug:
        tags.extend(["Carne Suína", "MAPA", "Agronegócio", "Certificações"])
    if "laticinio" in slug or "queijo" in slug or "leite" in slug:
        tags.extend(["Laticínios", "MAPA", "Agronegócio"])
    if "fruta" in slug or "manga" in slug:
        tags.extend(["Frutas", "Agronegócio", "MAPA"])
    if "software" in slug or "licenciamento" in slug:
        tags.extend(["Software", "Tecnologia", "Tributação"])
    if "educacao" in slug or "capacitacao" in slug:
        tags.extend(["Educação", "Carreira", "Capacitação"])
    if "erp" in slug or "gestao" in slug:
        tags.extend(["ERP", "Gestão", "Tecnologia", "Siscomex"])
    if "carga-aerea" in slug or "transporte" in slug:
        tags.extend(["Transporte Aéreo", "Logística", "Carga"])
    if "reefer" in slug or "cadeia-frio" in slug or "refrigerado" in slug:
        tags.extend(["Contêiner", "Cadeia do Frio", "Logística"])
    if "carga-perigosa" in slug or "imdg" in slug:
        tags.extend(["Carga Perigosa", "IMDG", "Logística", "Segurança"])
    if "mercosul" in slug or "uniao-europeia" in slug:
        tags.extend(["Mercosul", "União Europeia", "Acordos Comerciais"])
    if "turismo" in slug:
        tags.extend(["Turismo", "Serviços", "Câmbio"])
    if "aco" in slug or "mercosul" in slug:
        pass  # already tagged
    
    # Deduplicate while preserving order
    seen = set()
    result = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            result.append(t)
    return result


# Build post data
posts = []
for slug in NEW_SLUGS:
    filepath = os.path.join(CONTENT_DIR, f"{slug}.ts")
    if not os.path.exists(filepath):
        print(f"⚠️  Content file not found: {filepath}")
        continue
    
    title, excerpt = extract_title_excerpt(filepath)
    tags = get_tags(slug)
    
    # Word count for readTime
    with open(filepath) as f:
        words = len(f.read().split())
    read_time = max(8, round(words / 200))
    
    posts.append({
        "slug": slug,
        "title": title,
        "excerpt": excerpt,
        "readTime": read_time,
        "tags": tags,
        "words": words,
    })
    print(f"  ✅ {slug}: {title[:60]}... ({words}w, {read_time}min)")

print(f"\nTotal posts to integrate: {len(posts)}")

# Build entries
meta_entries = []
map_entries = []
prerender_entries = []

for p in posts:
    # Escape any double quotes in title/excerpt
    title_escaped = p["title"].replace('"', '\\"')
    excerpt_escaped = p["excerpt"].replace('"', '\\"')
    
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    meta_entries.append(
        f'  {{ slug: "{p["slug"]}", title: "{title_escaped}", excerpt: "{excerpt_escaped}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'
    )
    map_entries.append(f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),')
    prerender_entries.append(
        f'  {{ slug: "{p["slug"]}", name: "{title_escaped}", desc: "{excerpt_escaped}" }},'
    )

# --- 1. postMeta.ts ---
with open(POSTMETA, "r") as f:
    lines = f.readlines()

close_idx = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        close_idx = i
        break

if close_idx is None:
    raise ValueError("Could not find ]; in postMeta.ts")

for j, entry in enumerate(meta_entries):
    lines.insert(close_idx + j, entry + "\n")

with open(POSTMETA, "w") as f:
    f.writelines(lines)
print(f"✅ postMeta.ts: inserted {len(meta_entries)} entries (total: {close_idx + len(meta_entries) + 1})")

# --- 2. postContentMap.ts ---
with open(CONTENTMAP, "r") as f:
    lines = f.readlines()

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
    raise ValueError("Could not find map closing }; in postContentMap.ts")

for j, entry in enumerate(map_entries):
    lines.insert(close_map + j, entry + "\n")

with open(CONTENTMAP, "w") as f:
    f.writelines(lines)
print(f"✅ postContentMap.ts: inserted {len(map_entries)} entries")

# --- 3. scripts/prerender.mjs ---
with open(PRERENDER, "r") as f:
    lines = f.readlines()

prerender_close = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        prerender_close = i
        break

if prerender_close is None:
    raise ValueError("Could not find ]; in prerender.mjs")

for j, entry in enumerate(prerender_entries):
    lines.insert(prerender_close + j, entry + "\n")

with open(PRERENDER, "w") as f:
    f.writelines(lines)
print(f"✅ prerender.mjs: inserted {len(prerender_entries)} entries")

print("\n🎉 Integration complete!")
print(f"Expected: postMeta={1521 + len(posts)}, contentMap={1521 + len(posts)}, prerender~{1529 + len(posts)}")
