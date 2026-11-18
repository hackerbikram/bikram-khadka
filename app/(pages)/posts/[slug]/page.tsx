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

/**
 * Keep styles authored inside an HTML article inside the article content scope.
 * This prevents article-specific CSS from changing the surrounding page UI.
 */
function scopeArticleStyles(content: string): string {
  return content.replace(
    /<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi,
    (_match, attributes = '', css = '') =>
      `<style${attributes}>@scope (.article-content) { ${css} }</style>`,
  );
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
  const scopedHtmlContent = isHtmlContent ? scopeArticleStyles(post.content) : '';

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          Back to Articles
        </Link>

        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 font-mono text-xs text-neutral-600 shadow-sm">
          <span>👁️ {stats.views} views</span>
          <span className="text-neutral-300">·</span>
          <span>❤️ {stats.totalLikes} likes</span>
        </div>
      </nav>

      <header className="mb-10 border-b border-neutral-200 pb-9">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider">
          <Link
            href={`/?q=${encodeURIComponent(post.category || 'General')}#articles`}
            className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
          >
            {post.category || 'General'}
          </Link>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500">{post.readingTime || 1} min read</span>
        </div>

        <h1 className="mb-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-neutral-950 sm:text-5xl sm:leading-[1.12]">
          {post.title}
        </h1>

        <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
          {post.excerpt}
        </p>
      </header>

      {post.coverImage && (
        <figure className="mb-10 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-h-[480px] w-full object-cover"
          />
        </figure>
      )}

      <RecentTracker slug={post.slug} title={post.title} />

      <div className="article-content prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-950
        prose-p:leading-8 prose-p:text-neutral-700
        prose-a:font-medium prose-a:text-blue-700 prose-a:underline-offset-4 hover:prose-a:text-blue-800
        prose-strong:text-neutral-900
        prose-blockquote:border-blue-300 prose-blockquote:text-neutral-600
        prose-li:text-neutral-700
        prose-hr:border-neutral-200
        prose-img:rounded-2xl prose-img:shadow-sm
        prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-blue-800
        prose-pre:border prose-pre:border-neutral-200 prose-pre:bg-neutral-950 prose-pre:text-neutral-100
        prose-table:text-sm prose-th:bg-neutral-100 prose-th:text-neutral-900
        prose-td:text-neutral-700">
        {isHtmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: scopedHtmlContent }} />
        ) : (
          <ReactMarkdown>{post.content}</ReactMarkdown>
        )}
      </div>

      <div className="my-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-5 sm:px-6">
        <span className="text-sm font-semibold text-neutral-700">
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
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
            Tags:
          </span>
          {tagList.map((tag) => (
            <Link
              key={tag}
              href={`/?q=${encodeURIComponent(tag)}#articles`}
              className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              #{tag}
            </Link>
          ))}
        </footer>
      )}

      {relatedPosts.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <div className="mb-7">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Keep exploring
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
              Continue Reading
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/posts/${encodeURIComponent(related.slug)}`}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {related.category || 'General'}
                  </span>
                  <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-neutral-900 transition-colors group-hover:text-blue-700">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                      {related.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
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
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm font-medium text-neutral-500">
              Loading article...
            </div>
          }
        >
          <PostBodyAndEngagement slug={slug} />
        </Suspense>
      </div>
    </article>
  );
}
