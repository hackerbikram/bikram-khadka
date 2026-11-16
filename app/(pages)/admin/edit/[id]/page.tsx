import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db, initDb, type Post } from '@/app/lib/db';
import ArticleEditorStudio from '@/app/components/ArticleEditorStudio';

interface EditPageProps {
  params: Promise<{ id?: string }>;
}

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

async function getPostById(id: string): Promise<Post | null> {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE id = ?',
    args: [Number(id)],
  });
  return (result.rows[0] as unknown as Post) || null;
}

async function EditFormContainer({ params }: { params: Promise<{ id?: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  async function updatePost(formData: FormData) {
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
      sql: 'SELECT id FROM posts WHERE slug = ? AND id != ?',
      args: [slug, Number(id)],
    });

    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = calculateReadingTime(content);
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `UPDATE posts SET 
            title = ?, 
            slug = ?, 
            excerpt = ?, 
            content = ?, 
            category = ?, 
            tags = ?, 
            coverImage = ?, 
            metaTitle = ?, 
            metaDescription = ?, 
            readingTime = ?,
            updatedAt = ?
            WHERE id = ?`,
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
        updatedAt,
        Number(id),
      ],
    });

    redirect(`/posts/${encodeURIComponent(slug)}`);
  }

  return (
    <>
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          ← Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
          Edit Article Studio
        </h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">
          Update your content, live styles, and metadata for &quot;{post.title}&quot;.
        </p>
      </div>

      <ArticleEditorStudio
        initialTitle={post.title}
        initialSlug={post.slug}
        initialExcerpt={post.excerpt}
        initialContent={post.content}
        initialCategory={post.category || 'General'}
        initialTags={post.tags || ''}
        initialCoverImage={post.coverImage || ''}
        saveAction={updatePost}
        isEditing={true}
      />
    </>
  );
}

export default function ArticleEditPage({ params }: EditPageProps) {
  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="py-20 text-center text-neutral-400 font-medium">Loading editor workspace...</div>}>
        <EditFormContainer params={params} />
      </Suspense>
    </main>
  );
}