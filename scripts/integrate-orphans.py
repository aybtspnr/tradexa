#!/usr/bin/env python3
"""Integrate 2 orphan content files into shared files (postMeta, contentMap, prerender)."""

# Orphan data
orphans = [
    {
        "slug": "lgpd-protecao-dados-comex",
        "title": "LGPD e Proteção de Dados no Comércio Exterior: Guia Completo para Exportadores",
        "excerpt": "Guia completo sobre LGPD no comércio exterior: obrigações para exportadores, transferência internacional de dados, adequação à LGPD e proteção de dados em operações internacionais. Saiba como se adequar.",
        "readTime": 15,
        "tags": ["LGPD", "Proteção de Dados", "Compliance", "Comércio Exterior", "Exportação"],
    },
    {
        "slug": "seguro-credito-exportacao-sce",
        "title": "Seguro de Crédito à Exportação (SCE): Proteção Financeira para Exportadores Brasileiros",
        "excerpt": "Guia completo sobre Seguro de Crédito à Exportação (SCE): coberturas disponíveis, funcionamento, como contratar pela ABGF, custos e benefícios para exportadores brasileiros.",
        "readTime": 15,
        "tags": ["Seguro", "Crédito", "Exportação", "Financiamento", "Comércio Exterior"],
    },
]

DATE = "2026-06-28"

# Build entries
meta_entries = []
map_entries = []
prerender_entries = []

for p in orphans:
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    meta_entries.append(
        f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'
    )
    map_entries.append(f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),')
    prerender_entries.append(
        f'  {{ slug: "{p["slug"]}", name: "{p["title"]}", desc: "{p["excerpt"]}" }},'
    )

# --- postMeta.ts ---
with open("src/data/blog/postMeta.ts", "r") as f:
    lines = f.readlines()

# Find the last ]; that closes the array
close_idx = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        close_idx = i
        break

if close_idx is None:
    raise ValueError("Could not find ]; in postMeta.ts")

for j, entry in enumerate(meta_entries):
    lines.insert(close_idx + j, entry + "\n")

with open("src/data/blog/postMeta.ts", "w") as f:
    f.writelines(lines)

print(f"✅ postMeta.ts: inserted {len(meta_entries)} entries")

# --- postContentMap.ts ---
with open("src/data/blog/postContentMap.ts", "r") as f:
    lines = f.readlines()

# Find the }; that closes the map (must have getPostContent nearby)
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        # Check if getPostContent is within next 4 lines
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

with open("src/data/blog/postContentMap.ts", "w") as f:
    f.writelines(lines)

print(f"✅ postContentMap.ts: inserted {len(map_entries)} entries")

# --- scripts/prerender.mjs ---
with open("scripts/prerender.mjs", "r") as f:
    lines = f.readlines()

# Find the last ]; which closes BLOG_POSTS
prerender_close = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        prerender_close = i
        break

if prerender_close is None:
    raise ValueError("Could not find ]; in prerender.mjs")

for j, entry in enumerate(prerender_entries):
    lines.insert(prerender_close + j, entry + "\n")

with open("scripts/prerender.mjs", "w") as f:
    f.writelines(lines)

print(f"✅ prerender.mjs: inserted {len(prerender_entries)} entries")
print("✅ Orphan integration complete!")
