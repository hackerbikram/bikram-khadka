import { cacheLife, cacheTag } from 'next/cache';
import { db, initDb, type Post } from '@/app/lib/db';

function toPlainData(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toPlainData);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        toPlainData(item),
      ])
    );
  }

  return undefined;
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<Post | null> {
  'use cache';

  cacheLife('hours');
  cacheTag('posts', `post-${slug}`);

  await initDb();
  const decodedSlug = decodeURIComponent(slug);

  const result = await db.execute({
    sql: `
      SELECT *
      FROM posts
      WHERE slug = ?
        AND published = 1
      LIMIT 1
    `,
    args: [decodedSlug],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return toPlainData(row) as Post;
}

export async function getRelatedPosts(currentPost: Post): Promise<Post[]> {
  await initDb();
  const tags = currentPost.tags
    ? currentPost.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  if (tags.length > 0) {
    const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
    const tagArgs = tags.map((t) => `%${t}%`);

    const result = await db.execute({
      sql: `
        SELECT id, title, slug, excerpt, category, readingTime, views, createdAt
        FROM posts
        WHERE published = 1 AND id != ? AND (category = ? OR ${tagConditions})
        ORDER BY views DESC, createdAt DESC
        LIMIT 3
      `,
      args: [currentPost.id, currentPost.category || 'General', ...tagArgs],
    });

    if (result.rows.length > 0) {
      return result.rows as unknown as Post[];
    }
  }

  const fallback = await db.execute({
    sql: `
      SELECT id, title, slug, excerpt, category, readingTime, views, createdAt
      FROM posts
      WHERE published = 1 AND id != ?
      ORDER BY createdAt DESC
      LIMIT 3
    `,
    args: [currentPost.id],
  });

  return fallback.rows as unknown as Post[];
}