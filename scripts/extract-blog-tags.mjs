#!/usr/bin/env node
/**
 * Extract post slugs and their tags from postMeta.ts.
 * Outputs JSON in format: { "slug": ["tag1", "tag2", ...] }
 */
import { readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "data", "blog", "postMeta.ts"), "utf-8");

// Find the array
const arrStart = src.indexOf("export const blogPostsMeta");
const arrText = src.slice(src.indexOf("[", arrStart));

// Find all { ... } objects by scanning for balanced braces
const objects = [];
let depth = 0;
let objStart = -1;

for (let i = 0; i < arrText.length; i++) {
  if (arrText[i] === "{") {
    if (depth === 0) objStart = i;
    depth++;
  } else if (arrText[i] === "}") {
    depth--;
    if (depth === 0 && objStart >= 0) {
      objects.push(arrText.slice(objStart + 1, i));
      objStart = -1;
    }
  }
}

// Parse each object
const result = {};
for (const obj of objects) {
  // Extract slug
  const slugMatch = obj.match(/slug:\s*"([^"]+)"/);
  if (!slugMatch) continue;
  const slug = slugMatch[1];

  // Extract tags array
  const tagSection = obj.match(/tags:\s*\[([^\]]*)\]/);
  if (!tagSection) continue;
  const tags = tagSection[1]
    .split(",")
    .map(t => t.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
  
  result[slug] = tags;
}

console.log(JSON.stringify(result));
