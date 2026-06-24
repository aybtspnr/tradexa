/**
 * Extract blog post metadata from posts.ts and output JSON.
 * Outputs to stdout.
 */
import { readFileSync, writeFileSync } from "fs";

const src = readFileSync("src/data/blog/posts.ts", "utf-8");

// Find array
const arrStart = src.indexOf("export const blogPosts");
const bracket = src.indexOf("[", arrStart);
const arrText = src.slice(bracket);

// Find all slug entries
const slugRe = /slug:\s*"([^"]+)"/g;
let match;
const posts = [];

while ((match = slugRe.exec(arrText)) !== null) {
  const slug = match[1];
  const pos = match.index;
  
  // Find enclosing { ... } for this object
  // Go backward to find the nearest {
  let objStart = pos;
  while (objStart > 0 && arrText[objStart] !== "{") objStart--;
  
  // Go forward to find matching }
  let depth = 0;
  let objEnd = objStart;
  let inStr = false;
  let inTpl = false;
  let esc = false;
  
  for (let i = objStart; i < arrText.length; i++) {
    const c = arrText[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (inTpl) { if (c === "`") inTpl = false; continue; }
    if (inStr) { if (c === inStr) inStr = false; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "`") { inTpl = true; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { objEnd = i; break; } }
  }
  
  const objText = arrText.slice(objStart, objEnd + 1);
  
  // Extract title - first try single line
  let title = slug;
  const tMatch1 = objText.match(/title:\s*"([^"]+)"/);
  if (tMatch1) {
    title = tMatch1[1];
  } else {
    // Multi-line title
    const tMatch2 = objText.match(/title:\s*\n\s*"([^"]+)"/);
    if (tMatch2) title = tMatch2[1];
  }
  
  // Extract tags
  let tags = [];
  const tagMatch = objText.match(/tags:\s*\[([^\]]*)\]/);
  if (tagMatch) {
    tags = tagMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  
  posts.push({ slug, title, tags });
}

writeFileSync("/tmp/blog_posts.json", JSON.stringify(posts));
console.log(JSON.stringify(posts.slice(0, 2), null, 2));
console.error(`Extracted ${posts.length} posts`);
