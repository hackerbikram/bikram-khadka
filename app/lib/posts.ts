
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

  const result = await db.execute({
    sql: `
      SELECT *
      FROM posts
      WHERE slug = ?
        AND published = 1
      LIMIT 1
    `,
    args: [slug],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  // Convert the database Row into a plain JavaScript object.
  return toPlainData(row) as Post;
}
