export const instant = false;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { db, initDb, type Post } from '@/app/lib/db';
import LikeButton from './LikeButton';
import ShareButton from '@/app/components/shareButton';
import { getEngagementStats } from '@/app/actions/engagementAction';
import RecentTracker from '@/app/components/RecentTracker';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';
const SITE_NAME = 'Bikram';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getPublishedPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  await initDb();
  const decodedSlug = decodeURIComponent(slug);
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE slug = ? AND published = 1',
    args: [decodedSlug],
  });
  return (result.rows[0] as unknown as Post) || null;
});

async function getRelatedPosts(currentPost: Post): Promise<Post[]> {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: `Post Not Found — ${SITE_NAME}`,
    };
  }

  const postUrl = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;
  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || post.excerpt || '';
  const coverImageUrl = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${SITE_URL}${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`
    : undefined;

  return {
    title: `${metaTitle} — ${SITE_NAME}`,
    description: metaDescription,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: postUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.createdAt ? String(post.createdAt) : undefined,
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: coverImageUrl ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}

async function PostBodyAndEngagement({ slug }: { slug: string }) {
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  // Fire view increment, related posts, and stats completely in parallel
  const [, relatedPosts, stats] = await Promise.all([
    db.execute({
      sql: 'UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?',
      args: [post.id],
    }),
    getRelatedPosts(post),
    getEngagementStats(String(post.id)),
  ]);

  const tagList = post.tags
    ? post.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          ← Back to Articles
        </Link>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
          <span>👁️ {stats.views} views</span>
          <span>·</span>
          <span>❤️ {stats.totalLikes} likes</span>
        </div>
      </nav>

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
      </header>

      {post.coverImage && (
        <figure className="mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-h-[450px] w-full rounded-2xl object-cover shadow-xs"
          />
        </figure>
      )}
      <RecentTracker slug={post.slug} title={post.title} />

      <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
        {isHtmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <ReactMarkdown>{post.content}</ReactMarkdown>
        )}
      </div>

      <div className="my-12 flex flex-wrap items-center justify-between gap-4 border-y border-neutral-200 py-6">
        <span className="text-sm font-medium text-neutral-600">
          Found this article helpful?
        </span>
        <div className="flex items-center gap-3">
          <LikeButton
            postId={String(post.id)}
            initialLikes={stats.totalLikes}
            initialLiked={stats.userLiked}
          />
          <ShareButton title={post.title} />
        </div>
      </div>

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
    </>
  );
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
      <Suspense fallback={<div className="py-20 text-center text-neutral-400">Loading article...</div>}>
        <PostBodyAndEngagement slug={slug} />
      </Suspense>
    </article>
  );
}