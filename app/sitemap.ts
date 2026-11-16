import type { MetadataRoute } from 'next';
import { db, type Post } from '@/app/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const result = await db.execute(
    'SELECT slug, updatedAt FROM posts WHERE published = 1 ORDER BY createdAt DESC'
  );
  const posts = result.rows as unknown as Pick<Post, 'slug' | 'updatedAt'>[];

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ];
}