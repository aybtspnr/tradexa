/**
 * Add image field to every blog post in posts.ts using exact positions.
 * Restore backup first, then apply all insertions.
 */
import { readFileSync, writeFileSync } from "fs";

const POSTS_FILE = "src/data/blog/posts.ts";

// Restore backup
writeFileSync(POSTS_FILE, readFileSync(POSTS_FILE + ".bak", "utf-8"));
let src = readFileSync(POSTS_FILE, "utf-8");

// Find array
const arrStart = src.indexOf("export const blogPosts");
const bracket = src.indexOf("[", arrStart);
const arrOffset = bracket + 1; // position of first element in array

// Walk array to find each post object's boundaries
const posts = [];
let depth = 0;
let inStr = false;
let inTpl = false;
let esc = false;
let objStart = -1;

for (let i = arrOffset; i < src.length; i++) {
  const c = src[i];
  if (esc) { esc = false; continue; }
  if (c === "\\") { esc = true; continue; }
  if (inTpl) { if (c === "`") inTpl = false; continue; }
  if (inStr) { if (c === inStr) inStr = false; continue; }
  if (c === '"' || c === "'") { inStr = c; continue; }
  if (c === "`") { inTpl = true; continue; }
  
  if (c === "{") {
    if (depth === 0) objStart = i;
    depth++;
  } else if (c === "}") {
    depth--;
    if (depth === 0 && objStart !== -1) {
      const objText = src.slice(objStart, i + 1);
      
      // Extract slug
      const slugMatch = objText.match(/slug:\s*"([^"]+)"/);
      if (!slugMatch) { objStart = -1; continue; }
      const slug = slugMatch[1];
      
      // Skip if already has image
      if (objText.includes("image:")) { objStart = -1; continue; }
      
      // Find tags end position (absolute)
      const tagsMatch = objText.match(/tags:\s*\[[^\]]*\]/);
      if (!tagsMatch) { objStart = -1; continue; }
      
      // Position of the closing ] of tags, relative to objStart
      const tagsRelIdx = objText.indexOf(tagsMatch[0]);
      const tagsRelEnd = tagsRelIdx + tagsMatch[0].length;
      
      // Find after comma or newline
      let insRelIdx = tagsRelEnd;
      while (insRelIdx < objText.length && " \t\r".includes(objText[insRelIdx])) insRelIdx++;
      if (objText[insRelIdx] === ",") insRelIdx++;
      
      const absInsertIdx = objStart + insRelIdx;
      
      posts.push({
        slug,
        idx: absInsertIdx,
        text: `\n    image: "/images/blog/${slug}.png",`,
      });
      
      objStart = -1;
    }
  }
}

console.error(`Found ${posts.length} posts to update`);

// Apply from end to start
posts.sort((a, b) => b.idx - a.idx);
for (const p of posts) {
  src = src.slice(0, p.idx) + p.text + src.slice(p.idx);
}

writeFileSync(POSTS_FILE, src);
console.error(`✅ Added image: to ${posts.length} posts`);
console.log(`${posts.length} images added`);
