import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:blog.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export interface User {
  id?: number;
  email: string;
  password: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string;
  metaTitle: string | null;
  metaDescription: string | null;
  readingTime: number;
  published: number;
  views: number;
  like: number;
  createdAt: string;
  updatedAt: string;
}

let dbInitialized = false;

export async function createUserTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
}

export async function initDb() {
  if (dbInitialized) return;

  // 1. Create posts table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      coverImage TEXT,
      category TEXT DEFAULT 'General',
      tags TEXT DEFAULT '',
      metaTitle TEXT,
      metaDescription TEXT,
      readingTime INTEGER DEFAULT 1,
      published INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      "like" INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create users table
  await createUserTable();

  // 3. Safe auto-migration: Add columns if an older database table already exists without them
  try {
    await db.execute(`ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0`);
  } catch {}

  try {
    await db.execute(`ALTER TABLE posts ADD COLUMN "like" INTEGER DEFAULT 0`);
  } catch {}

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, createdAt DESC)`);

  dbInitialized = true;
}