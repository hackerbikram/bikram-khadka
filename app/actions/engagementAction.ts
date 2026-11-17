'use server';

import { db, initDb } from '@/app/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { error } from 'console';

let isTableInitialized = false;
async function ensureTable() {
  if (isTableInitialized) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        visitor_token TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(post_id, visitor_token)
      );
    `);
    isTableInitialized = true;
  } catch (error) {
    console.error('Table init error:', error);
  }
}

async function getVisitorToken(): Promise<string> {
  const cookieStore = await cookies();
  let visitorToken = cookieStore.get('visitor_token')?.value;

  if (!visitorToken) {
    visitorToken = crypto.randomUUID();
    cookieStore.set('visitor_token', visitorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return visitorToken;
}

export async function toggleLike(postId: string): Promise<{ totalLikes: number; userLiked: boolean }> {
  await ensureTable();
  const visitorToken = await getVisitorToken();
  const stringPostId = String(postId);

  const existing = await db.execute({
    sql: `SELECT id FROM post_likes WHERE post_id = ? AND visitor_token = ?`,
    args: [stringPostId, visitorToken],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: `DELETE FROM post_likes WHERE post_id = ? AND visitor_token = ?`,
      args: [stringPostId, visitorToken],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO post_likes (post_id, visitor_token, created_at) VALUES (?, ?, ?)`,
      args: [stringPostId, visitorToken, new Date().toISOString()],
    });
  }

  return await getEngagementStats(stringPostId);
}

export async function getEngagementStats(postId: string): Promise<{ totalLikes: number; userLiked: boolean; views: number }> {
  await ensureTable();
  const stringPostId = String(postId);
  const visitorToken = await getVisitorToken();

  // Run all three queries concurrently in parallel
  const [likesRes, userRes, postRes] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?`,
      args: [stringPostId],
    }),
    db.execute({
      sql: `SELECT 1 FROM post_likes WHERE post_id = ? AND visitor_token = ?`,
      args: [stringPostId, visitorToken],
    }),
    db.execute({
      sql: `SELECT views FROM posts WHERE id = ? OR slug = ?`,
      args: [stringPostId, stringPostId],
    }),
  ]);

  const totalLikes = Number((likesRes.rows[0] as any)?.count || 0);
  const userLiked = userRes.rows.length > 0;
  const views = Number((postRes.rows[0] as any)?.views || 0);

  return { totalLikes, userLiked, views };
}

export const getLike = async (post_id: string): Promise<number> => {
  if (!post_id) {
    return 0;
  }

  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?`,
    args: [String(post_id)],
  });

  const row = result.rows[0] as unknown as { count: number } | undefined;
  return Number(row?.count || 0);
};