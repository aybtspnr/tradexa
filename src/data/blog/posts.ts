// Re-export from code-split modules
// Metadata (~60KB) – loaded eagerly for listing pages
// Content – lazy-loaded per post (~12KB avg each)
export type { BlogPostMeta } from './postMeta';
export { blogPostsMeta as blogPosts } from './postMeta';
export { getPostContent } from './postContentMap';

// Legacy type alias for components that still use BlogPost
import type { BlogPostMeta } from './postMeta';
export type BlogPost = BlogPostMeta & { content: string; keyPoints?: string[] };
