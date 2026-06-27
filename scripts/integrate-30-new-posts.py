#!/usr/bin/env python3
"""
Integration script for 30 new blog posts.
Reads content files, extracts metadata, inserts into all 3 shared files.
"""
import os
import re
import math

WORKDIR = "/home/nuh_tapinar/tmp-build/project-clean"
CONTENT_DIR = os.path.join(WORKDIR, "src/data/blog/content")
META_FILE = os.path.join(WORKDIR, "src/data/blog/postMeta.ts")
MAP_FILE = os.path.join(WORKDIR, "src/data/blog/postContentMap.ts")
PRERENDER_FILE = os.path.join(WORKDIR, "scripts/prerender.mjs")
TODAY = "2026-06-27"

SLUG_PATTERN = re.compile(r'slug:\s*"')
IMPORT_PATTERN = re.compile(r':\s*\(\s*\)\s*=>\s*import')

NEW_SLUGS = [
    "exportar-para-alemanha-industria-oportunidades",
    "exportar-para-franca-agronegocio-luxo",
    "exportar-para-reino-unido-pos-brexit",
    "exportar-para-espanha-logistica-iberico",
    "exportar-para-italia-design-alimentos",
    "exportar-para-paises-baixos-hub-europeu",
    "exportar-para-nigeria-mercado-consumo",
    "exportar-para-egito-portal-norte-africa",
    "exportar-para-marrocos-plataforma-industrial",
    "exportar-para-africa-sul-economia-industrial",
    "exportar-para-quenia-portal-leste-africano",
    "exportar-para-gana-crescimento-oeste-africano",
    "exportar-cosmeticos-brasileiros-beleza-global",
    "exportar-frutas-brasil-mercado-internacional",
    "importar-brinquedos-seguranca-inmetro",
    "importar-bebidas-alcoolicas-tributacao",
    "exportar-carne-suina-mercados-internacionais",
    "exportar-pescados-aquicultura-mercado-global",
    "porto-paranagua-operacoes-logistica-guia",
    "porto-rio-grande-exportacao-logistica",
    "porto-itajai-navegantes-conteineres",
    "aeroportos-carga-brasil-logistica-aerea",
    "ferrovias-brasil-integracao-comex",
    "hidrovias-brasil-transporte-eficiencia",
    "proex-financiamento-exportacao-equalizacao",
    "bndes-exim-financiamento-exportadores",
    "drawback-isencao-regime-especial-guia",
    "deposito-alfandegado-certificado-dac-guia",
    "certificado-origem-digital-comex",
    "seguro-credito-exportacao-protecao",
]

def esc(s):
    s = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")
    return re.sub(r"\s+", " ", s).strip()

def infer_tags(slug, content_text):
    slug_lower = slug.lower()
    tags = []

    country_map = {
        "alemanha": ["Alemanha", "Europa", "Exportacao"],
        "franca": ["Franca", "Europa", "Exportacao"],
        "reino-unido": ["Reino Unido", "Europa", "Exportacao"],
        "espanha": ["Espanha", "Europa", "Exportacao"],
        "italia": ["Italia", "Europa", "Exportacao"],
        "paises-baixos": ["Paises Baixos", "Europa", "Exportacao"],
        "nigeria": ["Nigeria", "Africa", "Exportacao"],
        "egito": ["Egito", "Africa", "Exportacao"],
        "marrocos": ["Marrocos", "Africa", "Exportacao"],
        "africa-sul": ["Africa do Sul", "Africa", "Exportacao"],
        "quenia": ["Quenia", "Africa", "Exportacao"],
        "gana": ["Gana", "Africa", "Exportacao"],
    }
    for key, t in country_map.items():
        if key in slug_lower:
            tags.extend(x for x in t if x not in tags)
            break

    topic_map = {
        "cosmeticos": ["Cosmeticos", "Exportacao", "Beleza"],
        "frutas": ["Frutas", "Exportacao", "Agronegocio"],
        "brinquedos": ["Brinquedos", "Importacao", "INMETRO"],
        "bebidas-alcoolicas": ["Bebidas", "Importacao", "Tributacao"],
        "carne-suina": ["Carne Suina", "Exportacao", "Agronegocio"],
        "pescados": ["Pescados", "Exportacao", "Aquicultura"],
        "porto-paranagua": ["Porto de Paranagua", "Logistica Portuaria", "Infraestrutura"],
        "porto-rio-grande": ["Porto do Rio Grande", "Logistica Portuaria", "Infraestrutura"],
        "porto-itajai": ["Porto de Itajai", "Logistica Portuaria", "Infraestrutura"],
        "aeroportos-carga": ["Aeroportos de Carga", "Logistica Aerea", "Infraestrutura"],
        "ferrovias": ["Ferrovias", "Logistica", "Infraestrutura"],
        "hidrovias": ["Hidrovias", "Logistica", "Infraestrutura"],
        "proex": ["PROEX", "Financiamento", "Exportacao"],
        "bndes-exim": ["BNDES Exim", "Financiamento", "Exportacao"],
        "drawback-isencao": ["Drawback Isencao", "Regimes Aduaneiros", "Exportacao"],
        "deposito-alfandegado": ["DAC", "Armazenagem Alfandegada", "Regimes Aduaneiros"],
        "certificado-origem": ["Certificado de Origem", "Documentacao", "Exportacao"],
        "seguro-credito": ["Seguro de Credito", "Financiamento", "Exportacao"],
    }
    for key, t in topic_map.items():
        if key in slug_lower:
            tags.extend(x for x in t if x not in tags)
            break
    
    if "Comercio Exterior" not in tags:
        tags.append("Comercio Exterior")
    return tags

def extract_excerpt(content_text):
    after_title = re.sub(r"^##\s+.*?\n\n", "", content_text, count=1, flags=re.DOTALL)
    para_match = re.search(r"^(.+?)(?:\n\n|\n##)", after_title, re.DOTALL)
    excerpt = para_match.group(1).strip() if para_match else after_title[:300].strip()
    excerpt = re.sub(r"\*\*", "", excerpt)
    excerpt = re.sub(r"\s+", " ", excerpt).strip()
    if len(excerpt) <= 155:
        return excerpt
    cut = excerpt[:152].rfind(". ")
    if cut > 80:
        return excerpt[: cut + 1]
    return excerpt[:152] + "..."

def process_slug(slug):
    filepath = os.path.join(CONTENT_DIR, f"{slug}.ts")
    if not os.path.exists(filepath):
        print(f"  X {slug}: file not found")
        return None
    with open(filepath) as f:
        text = f.read()
    
    match = re.search(r"content = `(.*?)`;\s*export\s+const\s+keyPoints", text, re.DOTALL)
    if not match:
        print(f"  X {slug}: could not extract content")
        return None
    
    content_text = match.group(1)
    words = len(content_text.split())
    
    title_match = re.search(r"##\s+(.+?)(?:\n|$)", content_text)
    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()
    
    excerpt = extract_excerpt(content_text)
    read_time = max(8, math.ceil(words / 200))
    tags = infer_tags(slug, content_text)
    
    print(f"  reading {slug}: {words} words, ~{read_time}min")
    return {"slug": slug, "title": title, "excerpt": excerpt, "date": TODAY, "readTime": read_time, "tags": tags, "words": words}

def insert_before_marker(lines, marker):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def main():
    print(f"Processing {len(NEW_SLUGS)} new posts...\n")
    
    new_entries = []
    for slug in NEW_SLUGS:
        data = process_slug(slug)
        if data:
            new_entries.append(data)
    
    if len(new_entries) != len(NEW_SLUGS):
        print(f"\nERROR: Only processed {len(new_entries)}/{len(NEW_SLUGS)} slugs. Check missing files.")
        return
    
    new_entries.sort(key=lambda x: x["slug"])
    print(f"\nAll {len(new_entries)} posts processed. Generating entries...")
    
    # === postMeta.ts ===
    meta_entries = []
    for e in new_entries:
        slug_s = esc(e["slug"])
        title_s = esc(e["title"])
        excerpt_s = esc(e["excerpt"])
        tag_strings = ['"' + esc(t) + '"' for t in e["tags"]]
        tags_str = ", ".join(tag_strings)
        entry = '  { slug: "' + slug_s + '", title: "' + title_s + '", excerpt: "' + excerpt_s + '", date: "' + e["date"] + '", readTime: ' + str(e["readTime"]) + ', tags: [' + tags_str + '] },'
        meta_entries.append(entry)
    
    with open(META_FILE) as f:
        lines = f.readlines()
    pos = insert_before_marker(lines, "];")
    for j, entry in enumerate(meta_entries):
        lines.insert(pos + j, entry + "\n")
    meta_before = len(SLUG_PATTERN.findall(open(META_FILE).read()))
    with open(META_FILE, "w") as f:
        f.writelines(lines)
    meta_after = len(SLUG_PATTERN.findall(open(META_FILE).read()))
    print(f"postMeta.ts: {meta_before} -> {meta_after} (+{meta_after - meta_before})")
    
    # === postContentMap.ts ===
    map_entries = []
    for e in new_entries:
        slug_s = esc(e["slug"])
        map_entries.append('  "' + slug_s + '": () => import("./content/' + slug_s + '"),')
    
    with open(MAP_FILE) as f:
        lines = f.readlines()
    close_map = None
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "};":
            for j in range(i + 1, min(i + 5, len(lines))):
                if "export async function getPostContent" in lines[j]:
                    close_map = i
                    break
            if close_map is not None:
                break
    if close_map is None:
        print("X Could not find map closing '};' in postContentMap.ts")
        return
    
    for j, entry in enumerate(map_entries):
        lines.insert(close_map, entry + "\n")
    with open(MAP_FILE, "w") as f:
        f.writelines(lines)
    map_count = len(IMPORT_PATTERN.findall(open(MAP_FILE).read()))
    print(f"postContentMap.ts: {len(IMPORT_PATTERN.findall(open(MAP_FILE).read()))} entries")
    
    # === prerender.mjs ===
    prerender_entries = []
    for e in new_entries:
        slug_s = esc(e["slug"])
        name_s = esc(e["title"])
        desc_s = esc(e["excerpt"])
        if len(desc_s) > 155:
            cut = desc_s[:152].rfind(". ")
            desc_s = desc_s[: cut + 1] if cut > 80 else desc_s[:152] + "..."
        entry = '  { slug: "' + slug_s + '", name: "' + name_s + '", desc: "' + desc_s + '" },'
        prerender_entries.append(entry)
    
    with open(PRERENDER_FILE) as f:
        lines = f.readlines()
    blog_end = insert_before_marker(lines, "];")
    for j, entry in enumerate(prerender_entries):
        lines.insert(blog_end, entry + "\n")
    with open(PRERENDER_FILE, "w") as f:
        f.writelines(lines)
    
    prerender_count = 0
    in_section = False
    for line in open(PRERENDER_FILE).readlines():
        if "const BLOG_POSTS" in line:
            in_section = True
        elif line.strip() == "];" and in_section:
            in_section = False
        elif in_section and "slug:" in line:
            prerender_count += 1
    print(f"prerender.mjs BLOG_POSTS: {prerender_count} entries")
    
    # === Verification ===
    final_meta = len(SLUG_PATTERN.findall(open(META_FILE).read()))
    final_map = len(IMPORT_PATTERN.findall(open(MAP_FILE).read()))
    final_content = len(os.listdir(CONTENT_DIR))
    
    print(f"\n{'='*50}")
    print(f"FINAL COUNTS AFTER INTEGRATION")
    print(f"{'='*50}")
    print(f"postMeta.ts entries:  {final_meta}")
    print(f"Content files:        {final_content}")
    print(f"Content map entries:  {final_map}")
    print(f"Prerender entries:    {prerender_count}")
    
    # Check for duplicates
    all_meta_slugs = set(re.findall(r'slug:\s*"([^"]+)"', open(META_FILE).read()))
    if len(all_meta_slugs) == final_meta:
        print(f"✅ No duplicate slugs in postMeta ({final_meta} unique)")
    else:
        print(f"X DUPLICATES: {final_meta} entries but {len(all_meta_slugs)} unique")
    
    print(f"\nIntegration complete! {len(new_entries)} new posts added.")

if __name__ == "__main__":
    main()
