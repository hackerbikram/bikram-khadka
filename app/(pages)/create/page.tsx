import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, initDb } from '@/app/lib/db';
import ArticleEditorStudio from '@/app/components/ArticleEditorStudio';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export default function CreatePage() {
  async function savePost(formData: FormData) {
    'use server';

    await initDb();

    const title = (formData.get('title') as string)?.trim() || '';
    const rawSlug = (formData.get('slug') as string)?.trim() || '';
    const excerpt = (formData.get('excerpt') as string)?.trim() || '';
    const content = (formData.get('content') as string) || '';
    const category = (formData.get('category') as string)?.trim() || 'General';
    const tags = (formData.get('tags') as string)?.trim() || '';
    const coverImage = (formData.get('coverImage') as string)?.trim() || null;
    const metaTitle = (formData.get('metaTitle') as string)?.trim() || null;
    const metaDescription = (formData.get('metaDescription') as string)?.trim() || null;

    let slug = slugify(rawSlug || title) || `post-${Date.now()}`;

    const existing = await db.execute({
      sql: 'SELECT id FROM posts WHERE slug = ?',
      args: [slug],
    });

    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = calculateReadingTime(content);

    await db.execute({
      sql: `INSERT INTO posts 
            (title, slug, excerpt, content, category, tags, coverImage, metaTitle, metaDescription, readingTime, published) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        coverImage,
        metaTitle,
        metaDescription,
        readingTime,
      ],
    });

    redirect('/');
  }

  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
          Article Studio &amp; Live Styler
        </h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">
          Write content, format with HTML or Markdown, tweak styles live, and publish instantly.
        </p>
      </div>

      <ArticleEditorStudio saveAction={savePost} />
    </main>
  );
}