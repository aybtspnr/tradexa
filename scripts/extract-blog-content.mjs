/**
 * Extract Blog Content — Lê conteúdo real dos posts do blog
 *
 * Extrai o conteúdo markdown de cada slug a partir dos arquivos
 * individuais em src/data/blog/content/*.ts, converte para HTML
 * simples e gera um JSON de lookup para o prerender.
 *
 * Uso: node scripts/extract-blog-content.mjs
 * Saída: scripts/blog-content-map.json
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const CONTENT_DIR = resolve(PROJECT_ROOT, "src/data/blog/content");
const POSTS_DIR = resolve(PROJECT_ROOT, "src/data/blog/posts");
const OUTPUT_PATH = resolve(__dirname, "blog-content-map.json");

// ── Config do marked ──
marked.setOptions({
  gfm: true,
  breaks: true,
});

// ── Simple markdown → HTML converter (fallback) ──
function simpleMarkdownToHtml(md) {
  if (!md) return "";

  // Usar marked como conversor principal
  try {
    let html = marked.parse(md);
    // Remove wrapping <p> around block-level elements that marked wraps
    // marked wraps everything in <p> when breaks:true
    return html;
  } catch (e) {
    console.error("  ⚠️  marked failed, using fallback:", e.message);
  }

  // Fallback: basic conversion
  let html = md;
  // Code blocks (```...```)
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```/g, "").trim();
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Headings ##
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, (match, item) => `<li>${item}</li>`);
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)(?!\s*<li>)/g, "<ol>$1</ol>");
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#DC2626">$1</a>');
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");
  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Extract markdown from individual content files ──
function extractFromContentFiles() {
  const map = {};

  if (!existsSync(CONTENT_DIR)) {
    console.warn("⚠️  Content directory not found:", CONTENT_DIR);
    return map;
  }

  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".ts"));

  for (const file of files) {
    const slug = file.replace(/\.ts$/, "");
    const fullPath = resolve(CONTENT_DIR, file);
    const raw = readFileSync(fullPath, "utf-8");

    // Extract markdown from: export const content = `...`;
    // Template literal backticks are the only backticks in the file
    const match = raw.match(/export\s+const\s+content\s*=\s*`([\s\S]*?)`\s*[;,\]]/);
    if (match) {
      map[slug] = match[1].trim();
    } else {
      // Try alternate pattern: content = `\n...\n`
      const altMatch = raw.match(/export\s+const\s+content\s*=\s*`([\s\S]*?)`\s*;/);
      if (altMatch) {
        map[slug] = altMatch[1].trim();
      } else {
        console.warn(`  ⚠️  Could not extract content from: ${file}`);
      }
    }
  }

  return map;
}

// ── Extract markdown from batch files (fallback for slugs without content file) ──
function extractFromBatchFiles() {
  const map = {};

  if (!existsSync(POSTS_DIR)) return map;

  const files = readdirSync(POSTS_DIR).filter(
    (f) => f.endsWith(".ts") && f !== "types.ts"
  );

  for (const file of files) {
    const raw = readFileSync(resolve(POSTS_DIR, file), "utf-8");

    // Split by blog post objects: { ... }
    // Match each block between `{` and `},` or `};\n`
    const blocks = raw.split(/\n\s*\{/);
    for (const block of blocks) {
      const slugMatch = block.match(/slug:\s*"([^"]+)"/);
      if (!slugMatch) continue;
      const slug = slugMatch[1];
      if (map[slug]) continue; // already have it from content files

      // Extract content from: content: `...`
      const contentMatch = block.match(/content:\s*`([\s\S]*?)`\s*[,;\]]/);
      if (contentMatch) {
        map[slug] = contentMatch[1].trim();
      }
    }
  }

  return map;
}

// ── Convert all content to HTML ──
function convertAllToHtml(contentMap) {
  const result = {};
  let ok = 0,
    err = 0;

  for (const [slug, md] of Object.entries(contentMap)) {
    try {
      const html = simpleMarkdownToHtml(md);
      if (html && html.length > 50) {
        result[slug] = html;
        ok++;
      } else {
        console.warn(`  ⚠️  Short content for: ${slug} (${html?.length || 0} chars)`);
        result[slug] = html || "";
        ok++;
      }
    } catch (e) {
      console.error(`  ❌ Error converting ${slug}:`, e.message);
      result[slug] = "";
      err++;
    }
  }

  // Ensure every post has at least h2 structure for SEO
  let h2Added = 0;
  for (const [slug, html] of Object.entries(result)) {
    if (!html) continue;
    const hasH2 = /<h2[\\s>]/i.test(html);
    const hasH3 = /<h3[\\s>]/i.test(html);
    if (!hasH2 && !hasH3) {
      // Add introductory h2 to give the page proper heading structure
      result[slug] = `<h2>Introdução</h2>\n${html}`;
      h2Added++;
    }
  }
  if (h2Added > 0) {
    console.log(`  ✓ ${h2Added} posts received fallback H2 headings (no headings in source)`);
  }

  console.log(`  ✓ ${ok} posts converted, ${err} errors`);
  return result;
}

// ── Main ──
console.log("📖 Extracting blog content...");

const contentFromFiles = extractFromContentFiles();
console.log(`  ✓ ${Object.keys(contentFromFiles).length} slugs from content files`);

const contentFromBatch = extractFromBatchFiles();
console.log(`  ✓ ${Object.keys(contentFromBatch).length} slugs from batch files (fallback)`);

// Merge: prefer individual content files
const merged = { ...contentFromBatch, ...contentFromFiles };
console.log(`  ✓ ${Object.keys(merged).length} unique slugs total`);

console.log("\n🔄 Converting markdown to HTML...");
const htmlMap = convertAllToHtml(merged);

// Write output
writeFileSync(OUTPUT_PATH, JSON.stringify(htmlMap, null, 2), "utf-8");
console.log(`\n✅ Blog content map written: ${OUTPUT_PATH}`);
console.log(`   Total: ${Object.keys(htmlMap).length} posts with HTML content`);
