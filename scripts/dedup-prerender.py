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

# Count before
before_total = len(re.findall(r'slug:\s*"([^"]+)"', blog_section))
before_unique = len(set(re.findall(r'slug:\s*"([^"]+)"', blog_section)))

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
after_total = len(re.findall(r'slug:\s*"([^"]+)"', new_section))
after_unique = len(set(re.findall(r'slug:\s*"([^"]+)"', new_section)))
print(f"Before: {before_total} total, {before_unique} unique")
print(f"After:  {after_total} total, {after_unique} unique")
print(f"Duplicates removed: {before_total - after_total}")
