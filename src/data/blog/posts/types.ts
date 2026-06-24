export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  tags: string[];
  /** Banner/hero image URL (optional — posts without it use particle background) */
  image?: string;
  /** 3-5 key takeaways shown in a card below the title (optional) */
  keyPoints?: string[];
}
