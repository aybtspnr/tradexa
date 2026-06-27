// Re-export from code-split modules
// Metadata (~60KB) – loaded eagerly for listing pages
// Content – lazy-loaded per post (~12KB avg each)
export type { BlogPostMeta } from './postMeta';
import { blogPostsMeta as _blogPostsMeta } from './postMeta';
export { getPostContent } from './postContentMap';

export const blogPosts = _blogPostsMeta;

// Legacy type alias for components that still use BlogPost
import type { BlogPostMeta } from './postMeta';
export type BlogPost = BlogPostMeta & { content: string; keyPoints?: string[] };

// Legacy API — returns all blog post metadata for listing pages
export function getAllPosts(): BlogPostMeta[] {
  return _blogPostsMeta;
}
