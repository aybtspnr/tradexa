#!/usr/bin/env python3
"""Deduplicate BLOG_POSTS entries in prerender.mjs"""
import re

with open("scripts/prerender.mjs", "r") as f:
    content = f.read()

# Find BLOG_POSTS section
blog_start = content.find("const BLOG_POSTS = [")
blog_end = content.find("];", blog_start) + 2

before = content[:blog_start]
blog_section = content[blog_start:blog_end]
after = content[blog_end:]

# Extract unique entries by slug
entries = re.findall(r'(\s*\{[^}]+\}),?', blog_section)
seen = set()
unique_entries = []
for entry in entries:
    slug_match = re.search(r'slug: "([^"]+)"', entry)
    if not slug_match:
        unique_entries.append(entry)
        continue
    slug = slug_match.group(1)
    if slug not in seen:
        seen.add(slug)
        unique_entries.append(entry)

# Rebuild BLOG_POSTS section
new_section = "const BLOG_POSTS = [\n"
for entry in unique_entries:
    new_section += entry.strip() + ",\n"
new_section += "];"

content = before + new_section + after

with open("scripts/prerender.mjs", "w") as f:
    f.write(content)

# Verify
import subprocess
unique_count = subprocess.run(["bash", "-c", "awk '/^const BLOG_POSTS/,/^];/' scripts/prerender.mjs | grep -oP 'slug: \"\\K[^\"]+' | sort -u | wc -l"], capture_output=True, text=True).stdout.strip()
total_count = subprocess.run(["bash", "-c", "awk '/^const BLOG_POSTS/,/^];/' scripts/prerender.mjs | grep -c 'slug:'"], capture_output=True, text=True).stdout.strip()
print(f"Before fix: 849 total", flush=True)
print(f"After fix: {total_count} total, {unique_count} unique", flush=True)
print(f"Duplicates removed: {849 - int(total_count)}", flush=True)
