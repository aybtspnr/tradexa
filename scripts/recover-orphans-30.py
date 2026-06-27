#!/usr/bin/env python3
"""
Recover orphaned blog content files — content/<slug>.ts files that exist
but have NO corresponding entry in postMeta.ts or postContentMap.ts.
(Prerender entries already exist for all of them.)

Scans content/*.ts, compares against existing postMeta slugs,
skips files under 2000 words, extracts metadata, inserts into
postMeta.ts and postContentMap.ts only (prerender is already in sync).
"""
import os
import re
import math

WORKDIR = "/home/nuh_tapinar/tmp-build/project-clean"
CONTENT_DIR = os.path.join(WORKDIR, "src/data/blog/content")
META_FILE = os.path.join(WORKDIR, "src/data/blog/postMeta.ts")
MAP_FILE = os.path.join(WORKDIR, "src/data/blog/postContentMap.ts")
TODAY = "2026-06-27"

# Pre-compiled regex patterns
SLUG_PATTERN = re.compile(r'slug:\s*"')
IMPORT_PATTERN = re.compile(r':\s*\(\s*\)\s*=>\s*import')

def esc(s):
    s = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")
    return re.sub(r"\s+", " ", s).strip()

def infer_tags(slug, content_text):
    slug_lower = slug.lower()
    tags = []

    country_map = {
        "alemanha": ["Alemanha", "Europa", "Exportacao"],
        "angola": ["Angola", "Africa", "Exportacao", "Lusofonos"],
        "argentina": ["Argentina", "America do Sul", "Exportacao"],
        "bangladesh": ["Bangladesh", "Asia", "Exportacao", "Textil"],
        "chile": ["Chile", "America do Sul", "Exportacao"],
        "colombia": ["Colombia", "America do Sul", "Exportacao"],
        "coreia-sul": ["Coreia do Sul", "Asia", "Exportacao", "Eletronicos"],
        "eua": ["EUA", "America do Norte", "Exportacao"],
        "india": ["India", "Asia", "Exportacao"],
        "indonesia": ["Indonesia", "Asia", "Exportacao"],
        "mexico": ["Mexico", "America do Norte", "Exportacao"],
        "paquistao": ["Paquistao", "Asia", "Exportacao"],
        "peru": ["Peru", "America do Sul", "Exportacao"],
        "taiwan": ["Taiwan", "Asia", "Exportacao", "Semicondutores"],
        "turquia": ["Turquia", "Europa/Asia", "Exportacao", "Logistica"],
        "vietna": ["Vietna", "Asia", "Exportacao"],
        "china": ["China", "Asia", "Importacao", "Exportacao"],
        "africa-do-sul": ["Africa do Sul", "Africa", "Exportacao"],
    }
    for key, t in country_map.items():
        if key in slug_lower:
            tags.extend(x for x in t if x not in tags)
            break

    topic_map = {
        "admissao-temporaria": ["Admissao Temporaria", "Regimes Aduaneiros", "Importacao"],
        "armazenagem": ["Armazenagem Alfandegada", "Logistica", "Importacao"],
        "barreiras-tecnicas": ["Barreiras Tecnicas", "Regulamentacao", "Exportacao"],
        "direito-aduaneiro": ["Direito Aduaneiro", "Infracoes", "Compliance"],
        "extarifario": ["Ex-Tarifario", "Bens de Capital", "Tributacao"],
        "ipi-importacao": ["IPI", "Tributacao", "Importacao"],
        "licencas": ["Licenciamento", "LI", "Importacao"],
        "logistica-reversa": ["Logistica Reversa", "Sustentabilidade", "Logistica"],
        "oea": ["OEA", "Compliance", "Certificacao"],
        "pis-cofins": ["PIS/COFINS", "Tributacao", "Importacao"],
        "porto-santos": ["Porto de Santos", "Logistica Portuaria", "Infraestrutura"],
        "propriedade-intelectual": ["Propriedade Intelectual", "Compliance", "Patentes"],
        "protecionismo": ["Protecionismo", "Barreiras Comerciais", "Comercio Internacional"],
        "recof": ["RECOF", "SPED", "Regimes Aduaneiros"],
        "regime-tributacao": ["Regime Tributario", "Tributacao", "Importacao"],
        "transito-aduaneiro": ["Transito Aduaneiro", "Logistica", "Importacao"],
        "transporte-ferroviario": ["Transporte Ferroviario", "Logistica", "Infraestrutura"],
        "transporte-multimodal": ["Transporte Multimodal", "Logistica", "Eficiencia"],
        "zpe": ["ZPE", "Zonas de Processamento", "Exportacao"],
        "acordo-comercial": ["Acordos Comerciais", "EUA", "Exportacao"],
        "brics": ["BRICS", "Acordos Comerciais", "Exportacao"],
        "cptpp": ["CPTPP", "Acordos Comerciais", "Asia-Pacifico"],
        "bbc": ["BBC", "Compras Governamentais", "Exportacao"],
        "importacao-eletronicos": ["Eletronicos", "Importacao", "Consumo"],
    }
    for key, t in topic_map.items():
        if key in slug_lower:
            tags.extend(x for x in t if x not in tags)
            break

    # Always add "Comercio Exterior" if not already there
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
        return None
    with open(filepath) as f:
        text = f.read()
    
    match = re.search(r"content = `(.*?)`;\s*export\s+const\s+keyPoints", text, re.DOTALL)
    if not match:
        print(f"  X {slug}: could not extract content")
        return None
    
    content_text = match.group(1)
    words = len(content_text.split())
    if words < 2000:
        print(f"  ** {slug}: {words} words (thin, skipping)")
        return None
    
    title_match = re.search(r"##\s+(.+?)(?:\n|$)", content_text)
    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()
    
    excerpt = extract_excerpt(content_text)
    read_time = max(8, math.ceil(words / 200))
    date = TODAY
    tags = infer_tags(slug, content_text)
    
    print(f"  OK {slug}: {words} words, ~{read_time}min - {title[:60]}")
    return {"slug": slug, "title": title, "excerpt": excerpt, "date": date, "readTime": read_time, "tags": tags, "words": words}

def insert_before_marker(lines, marker):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def main():
    # Get existing slugs from postMeta
    with open(META_FILE) as f:
        meta_content = f.read()
    existing_slugs = set(re.findall(r'slug:\s*"([^"]+)"', meta_content))
    
    # Find orphans
    orphans = sorted(
        f[:-3] for f in os.listdir(CONTENT_DIR) if f.endswith(".ts") and f[:-3] not in existing_slugs
    )
    print(f"Found {len(orphans)} orphan content files")
    
    # Process each orphan
    new_entries = []
    thin_orphans = []
    for slug in orphans:
        data = process_slug(slug)
        if data:
            new_entries.append(data)
        else:
            thin_orphans.append(slug)
    
    print(f"\nOK {len(new_entries)} quality entries ready (>=2000 words)")
    print(f"** {len(thin_orphans)} thin orphans skipped (<2000 words): {', '.join(thin_orphans)}")
    if not new_entries:
        print("Nothing to recover. Exiting.")
        return
    
    new_entries.sort(key=lambda x: x["slug"])
    
    # === postMeta.ts insertion ===
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
    with open(META_FILE, "w") as f:
        f.writelines(lines)
    
    meta_count = len(SLUG_PATTERN.findall(open(META_FILE).read()))
    print(f"\nOK postMeta.ts: +{len(meta_entries)} entries (total: {meta_count})")
    
    # === postContentMap.ts insertion ===
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
    print(f"OK postContentMap.ts: +{len(map_entries)} entries (total: {map_count})")
    
    # === Verification ===
    content_c = len(os.listdir(CONTENT_DIR))
    
    print(f"\n{'='*50}")
    print(f"FINAL COUNTS")
    print(f"{'='*50}")
    print(f"postMeta.ts entries:  {meta_count}")
    print(f"Content files:        {content_c}")
    print(f"Content map entries:  {map_count}")
    print(f"Remaining thin:       {len(thin_orphans)} ({', '.join(thin_orphans)})")
    
    print(f"\nRecovery complete! {len(new_entries)} orphans integrated.")
    for e in new_entries:
        print(f"  OK {e['slug']} ({e['words']} words)")

if __name__ == "__main__":
    main()
