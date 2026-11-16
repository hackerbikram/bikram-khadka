import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { db, initDb, type Post } from '@/app/lib/db';
import LikeButton from './LikeButton';

export const instant = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE slug = ? AND published = 1',
    args: [slug],
  });
  return (result.rows[0] as unknown as Post) || null;
}

// Server action for handling likes
async function incrementLike(postId: number): Promise<number> {
  'use server';
  await db.execute({
    sql: 'UPDATE posts SET "like" = "like" + 1 WHERE id = ?',
    args: [postId],
  });
  const res = await db.execute({
    sql: 'SELECT "like" FROM posts WHERE id = ?',
    args: [postId],
  });
  return (res.rows[0]?.like as number) || 0;
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  const seoTitle = post.metaTitle || post.title;
  const seoDesc = post.metaDescription || post.excerpt;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: `${SITE_URL}/posts/${post.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      url: `${SITE_URL}/posts/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

// 2. Article Page Component
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  // Increment view count safely inside request lifecycle
  await db.execute({
    sql: 'UPDATE posts SET views = views + 1 WHERE id = ?',
    args: [post.id],
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    image: post.coverImage || undefined,
    url: `${SITE_URL}/posts/${post.slug}`,
  };

  const tagList = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <article className="max-w-3xl mx-auto py-12 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-black transition">
          ← Back to Articles
        </Link>
        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
          <span>👁️ {post.views + 1} views</span>
        </div>
      </nav>

      <header className="mb-10 border-b border-neutral-200 pb-8">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider gray-300 mb-3">
          <span>{post.category || 'General'}</span>
          <span>•</span>
          <span>{post.readingTime} min read</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-400 leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-neutral-300 leading-relaxed mb-4">
          {post.excerpt}
        </p>

        <time dateTime={post.createdAt} className="text-sm text-neutral-300">
          Published on{' '}
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>

      {post.coverImage && (
        <figure className="mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto rounded-xl object-cover max-h-[450px]"
          />
        </figure>
      )}

      <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Like Button Section */}
      <div className="my-12 py-6 border-y border-neutral-200 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-300">Found this article helpful?</span>
        <LikeButton postId={post.id} initialLikes={post.like || 0} incrementLikeAction={incrementLike} />
      </div>

      {tagList.length > 0 && (
        <footer className="mt-8 flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <span
              key={tag}
              className="bg-neutral-100 text-neutral-900 text-xs font-medium px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}