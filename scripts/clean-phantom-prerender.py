#!/usr/bin/env python3
"""Remove phantom slugs from prerender BLOG_POSTS (slugs not in postMeta)"""
import re

# Read slugs from postMeta
with open("src/data/blog/postMeta.ts", "r") as f:
    meta_content = f.read()
meta_slugs = set(re.findall(r'slug: "([^"]+)"', meta_content))
print(f"postMeta slugs: {len(meta_slugs)}")

# Read prerender
with open("scripts/prerender.mjs", "r") as f:
    content = f.read()

# Find BLOG_POSTS section
blog_start = content.find("const BLOG_POSTS = [")
blog_end = content.find("];", blog_start) + 2

before = content[:blog_start]
blog_section = content[blog_start:blog_end]
after = content[blog_end:]

# Filter entries - keep only those with slugs in postMeta
entries = re.findall(r'(\s*\{[^}]+\}),?', blog_section)
filtered = []
removed = []
for entry in entries:
    slug_match = re.search(r'slug: "([^"]+)"', entry)
    if not slug_match:
        filtered.append(entry)
        continue
    slug = slug_match.group(1)
    if slug in meta_slugs:
        filtered.append(entry)
    else:
        removed.append(slug)

print(f"Removed {len(removed)} phantom entries:")
for s in removed:
    print(f"  - {s}")

# Rebuild
new_section = "const BLOG_POSTS = [\n"
for entry in filtered:
    new_section += entry.strip() + ",\n"
new_section += "];"

content = before + new_section + after

with open("scripts/prerender.mjs", "w") as f:
    f.write(content)

# Verify
final_count = len(re.findall(r'slug:\s*"([^"]+)"', new_section))
print(f"Prerender after cleanup: {final_count} entries")
