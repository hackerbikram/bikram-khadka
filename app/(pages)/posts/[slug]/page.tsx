import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ReactMarkdown from 'react-markdown';
import { db, initDb, type Post } from '@/app/lib/db';
import LikeButton from './LikeButton';

export const instant = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'Bikram';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Deduplicates DB call between generateMetadata() and PostPage()
const getPublishedPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  await initDb();
  const decodedSlug = decodeURIComponent(slug);
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE slug = ? AND published = 1',
    args: [decodedSlug],
  });
  return (result.rows[0] as unknown as Post) || null;
});

// Fetch related articles matching category or tags
async function getRelatedPosts(currentPost: Post): Promise<Post[]> {
  const tags = currentPost.tags
    ? currentPost.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  if (tags.length > 0) {
    const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
    const tagArgs = tags.map((t) => `%${t}%`);

    const result = await db.execute({
      sql: `
        SELECT id, title, slug, excerpt, category, readingTime, views, "like", createdAt
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
      SELECT id, title, slug, excerpt, category, readingTime, views, "like", createdAt
      FROM posts
      WHERE published = 1 AND id != ?
      ORDER BY createdAt DESC
      LIMIT 3
    `,
    args: [currentPost.id],
  });

  return fallback.rows as unknown as Post[];
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

  if (!post) {
    return {
      title: 'Post Not Found',
      robots: { index: false, follow: false },
    };
  }

  const seoTitle = post.metaTitle || post.title;
  const seoDesc = post.metaDescription || post.excerpt;
  const canonicalUrl = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;
  const keywords = post.tags
    ? post.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [post.category || 'Technology'];

  return {
    title: `${seoTitle} — ${SITE_NAME}`,
    description: seoDesc,
    keywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: 'article',
      siteName: SITE_NAME,
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt || post.createdAt).toISOString(),
      section: post.category || 'General',
      tags: keywords,
      url: canonicalUrl,
      images: post.coverImage ? [{ url: post.coverImage, alt: seoTitle }] : [],
    },
    twitter: {
      card: post.coverImage ? 'summary_large_image' : 'summary',
      title: seoTitle,
      description: seoDesc,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

// 2. Article Page Component
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  // Increment view count & fetch related posts in parallel
  const [, relatedPosts] = await Promise.all([
    db.execute({
      sql: 'UPDATE posts SET views = views + 1 WHERE id = ?',
      args: [post.id],
    }),
    getRelatedPosts(post),
  ]);

  const tagList = post.tags
    ? post.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const canonicalUrl = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;
  const wordCount = post.content.trim().split(/\s+/).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
    articleSection: post.category || 'General',
    keywords: tagList.join(', '),
    wordCount,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
    url: canonicalUrl,
  };

  // Check if content contains raw HTML tags (e.g. <div, <p, <span, <section)
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
      {/* XSS-Safe Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Breadcrumb & Live Stats */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          ← Back to Articles
        </Link>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
          <span>👁️ {(post.views || 0) + 1} views</span>
          <span>·</span>
          <span>❤️ {post.like || 0} likes</span>
        </div>
      </nav>

      {/* Article Header */}
      <header className="mb-10 border-b border-neutral-200 pb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Link
            href={`/?q=${encodeURIComponent(post.category || 'General')}#articles`}
            className="rounded-full bg-blue-50 px-3 py-1 transition hover:bg-blue-100"
          >
            {post.category || 'General'}
          </Link>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500">{post.readingTime || 1} min read</span>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-neutral-950 sm:text-5xl">
          {post.title}
        </h1>

        <p className="mb-4 text-lg leading-relaxed text-neutral-600">
          {post.excerpt}
        </p>

        <time
          dateTime={new Date(post.createdAt).toISOString()}
          className="text-sm font-medium text-neutral-400"
        >
          Published on{' '}
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <figure className="mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-h-[450px] w-full rounded-2xl object-cover shadow-xs"
          />
        </figure>
      )}

      {/* Article Content Body (Renders Markdown or Custom Styled HTML automatically) */}
      <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
        {isHtmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <ReactMarkdown>{post.content}</ReactMarkdown>
        )}
      </div>

      {/* Like Button Section */}
      <div className="my-12 flex items-center justify-between border-y border-neutral-200 py-6">
        <span className="text-sm font-medium text-neutral-600">
          Found this article helpful?
        </span>
        <LikeButton
          postId={post.id}
          initialLikes={post.like || 0}
          incrementLikeAction={incrementLike}
        />
      </div>

      {/* Clickable Tags for Instant Topic/Tag Discovery */}
      {tagList.length > 0 && (
        <footer className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Tags:
          </span>
          {tagList.map((tag) => (
            <Link
              key={tag}
              href={`/?q=${encodeURIComponent(tag)}#articles`}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              #{tag}
            </Link>
          ))}
        </footer>
      )}

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-neutral-950">
            Continue Reading
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/posts/${encodeURIComponent(related.slug)}`}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {related.category || 'General'}
                  </span>
                  <h3 className="mt-2 line-clamp-2 text-sm font-bold text-neutral-950 transition-colors group-hover:text-blue-600">
                    {related.title}
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{related.readingTime || 1} min read</span>
                  <span>👁️ {related.views || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}