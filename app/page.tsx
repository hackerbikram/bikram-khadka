import Link from 'next/link';
import { Suspense } from 'react';
import { db, initDb, type Post } from '@/app/lib/db';
import type { Metadata } from 'next';
import ArticleExplorer from '@/app/components/ArticleExplorer';
import { getLike } from '@/app/actions/engagementAction';

const SITE_NAME = 'Bikram Article';
const AUTHOR_NAME = 'Bikram Khadka';
const SITE_DESCRIPTION =
  'Official blog and technical journal by Bikram Khadka (Bikram Article). Explore practical tutorials on software development, Python, Next.js, web engineering, and business technology.';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';
const POSTS_PER_PAGE = 30;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    absolute: 'Bikram Article — Software Development & Technology Blog by Bikram Khadka',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  generator: 'Next.js',
  publisher: AUTHOR_NAME,
  keywords: [
    'bikram article',
    'bikram blog',
    'bikram khadka',
    'software engineering tutorials',
    'Python programming',
    'Next.js 16 development',
    'web engineering',
    'Turso SQLite blog',
    'business technology innovation',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: 'Bikram Article — Technology, Development & Business Insights',
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bikram Article — Bikram Khadka Tech Blog',
    description: SITE_DESCRIPTION,
    creator: '@bikramkhadka',
  },
};

function formatDate(date: string | Date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently published';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function getISODate(date: string | Date) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryId(category: string) {
  return `topic-${slugify(category) || 'general'}`;
}

function safeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

async function getPublishedPosts(): Promise<Post[]> {
  await initDb();

  const result = await db.execute(
    `SELECT
      id,
      title,
      slug,
      excerpt,
      category,
      tags,
      readingTime,
      views,
      createdAt
    FROM posts
    WHERE published = 1
    ORDER BY createdAt DESC
    LIMIT ${POSTS_PER_PAGE}`
  );

  const rawPosts = result.rows.map((row) => ({
    id: Number(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    excerpt: String(row.excerpt ?? ''),
    content: '',
    coverImage: row.coverImage ? String(row.coverImage) : null,
    category: String(row.category ?? 'General'),
    tags: String(row.tags ?? ''),
    metaTitle: null,
    metaDescription: null,
    readingTime: Number(row.readingTime ?? 1),
    published: 1,
    views: Number(row.views ?? 0),
    createdAt: String(row.createdAt ?? ''),
    updatedAt: String(row.updatedAt ?? row.createdAt ?? ''),
  }));

  // Fetch real like counts in parallel for all published posts
  const postsWithLikes = await Promise.all(
    rawPosts.map(async (post) => {
      const likeCount = await getLike(String(post.id));
      return {
        ...post,
        like: likeCount,
      };
    })
  );

  return postsWithLikes;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-500">
          {description}
        </p>
      )}
    </div>
  );
}

function ArticleMeta({
  category,
  date,
  readingTime,
  views,
  likes,
}: {
  category: string;
  date: string | Date;
  readingTime: number;
  views?: number;
  likes?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span className="rounded-full bg-blue-50 px-3 py-1.5 font-bold uppercase tracking-wide text-blue-700">
        {category}
      </span>
      <time dateTime={getISODate(date)} className="font-medium text-neutral-400">
        {formatDate(date)}
      </time>
      <span className="text-neutral-300">·</span>
      <span className="font-medium text-neutral-400">{readingTime} min read</span>
      {(views !== undefined || likes !== undefined) && (
        <>
          <span className="text-neutral-300">·</span>
          <div className="flex items-center gap-2.5 font-mono text-neutral-500">
            {views !== undefined && <span>👁️ {views}</span>}
            {likes !== undefined && <span>❤️ {likes}</span>}
          </div>
        </>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[450px] w-[450px] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Bikram Article · Software Engineering · Business Innovation
          </div>

          <h1 className="text-5xl font-black leading-[1.06] tracking-[-0.065em] text-neutral-950 sm:text-6xl lg:text-[76px]">
            Ideas worth
            <br />
            <span className="text-blue-600">understanding.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
            Welcome to <strong className="font-semibold text-neutral-800">Bikram Article</strong>—the personal tech blog and engineering journal by <strong className="font-semibold text-neutral-800">Bikram Khadka</strong>. Exploring practical software architecture, web development, and smarter digital business solutions.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/#articles"
              className="inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Explore articles
              <span aria-hidden="true">↓</span>
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400"
            >
              Share your knowledge
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap gap-x-10 gap-y-4 border-t border-neutral-100 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400 sm:text-xs">
          <span>01 — Software Engineering</span>
          <span>02 — Technology &amp; Code</span>
          <span>03 — Business Innovation</span>
        </div>
      </div>
    </section>
  );
}

function FeaturedArticle({ post }: { post: Post }) {
  const category = post.category?.trim() || 'General';

  return (
    <section
      id="featured"
      className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-20 sm:px-8 lg:px-12"
    >
      <div className="mb-8 flex items-end justify-between">
        <SectionHeading
          eyebrow="Editor's selection"
          title="Featured article"
        />
        <span className="hidden text-[10px] font-bold tracking-[0.2em] text-neutral-300 sm:block">
          01 / FEATURED
        </span>
      </div>

      <article
        id={categoryId(category)}
        className="group relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-7 shadow-sm transition duration-500 hover:shadow-xl sm:p-10 lg:p-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-50 transition-transform duration-700 group-hover:scale-125" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_200px] lg:items-end">
          <div>
            <ArticleMeta
              category={category}
              date={post.createdAt}
              readingTime={post.readingTime || 1}
              views={post.views}
              likes={post.like}
            />

            <h3 className="mt-7 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.04em] text-neutral-950 transition-colors group-hover:text-blue-600 sm:text-4xl lg:text-5xl">
              {post.title}
            </h3>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-neutral-500 sm:text-base">
              {post.excerpt || 'Discover practical insights, useful ideas and knowledge in this article.'}
            </p>

            <Link
              href={`/posts/${encodeURIComponent(post.slug)}`}
              className="mt-9 inline-flex items-center gap-3 text-sm font-bold text-neutral-950 transition-colors hover:text-blue-600"
            >
              Read featured article
              <span className="transition-transform group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>

          <div className="flex items-end justify-between border-t border-neutral-100 pt-6 lg:flex-col lg:items-end lg:justify-end lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8">
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              Reading time
            </span>
            <div className="mt-2">
              <span className="text-5xl font-black tracking-tight text-neutral-950">
                {post.readingTime || 1}
              </span>
              <span className="ml-2 text-sm text-neutral-400">min read</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function TopicNavigation({ categories }: { categories: string[] }) {
  if (!categories.length) return null;

  return (
    <section
      id="topics"
      className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-20 sm:px-8 lg:px-12"
    >
      <SectionHeading
        eyebrow="Discover"
        title="Explore topics"
        description="Find articles by subject and explore the topics that interest you on Bikram Blog."
      />

      <div className="mt-7 flex flex-wrap gap-3">
        {categories.map((category) => (
          <a
            key={category}
            href={`#${categoryId(category)}`}
            className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {category}
          </a>
        ))}
      </div>
    </section>
  );
}

function BlogStructuredData({ posts }: { posts: Post[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: 'en',
    author: { '@type': 'Person', name: AUTHOR_NAME, url: SITE_URL },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || SITE_DESCRIPTION,
      url: `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`,
      ...(getISODate(post.createdAt) ? { datePublished: getISODate(post.createdAt) } : {}),
      author: { '@type': 'Person', name: AUTHOR_NAME },
      ...(post.category ? { articleSection: post.category } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
    />
  );
}

async function BlogContent() {
  const posts = await getPublishedPosts();

  const featuredPost = posts[0];
  const categories = Array.from(
    new Set(posts.map((post) => post.category?.trim() || 'General').filter(Boolean))
  );

  return (
    <>
      <BlogStructuredData posts={posts} />
      {featuredPost && <FeaturedArticle post={featuredPost} />}
      <TopicNavigation categories={categories} />
      <ArticleExplorer posts={posts} />
    </>
  );
}

function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-5 py-20 sm:px-8 lg:px-12">
      <div className="animate-pulse rounded-[28px] border border-neutral-200 bg-white p-8 sm:p-12">
        <div className="h-5 w-32 rounded-full bg-neutral-100" />
        <div className="mt-8 h-10 max-w-2xl rounded-lg bg-neutral-100" />
        <div className="mt-4 h-5 max-w-xl rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-900">
      <Hero />
      <Suspense fallback={<BlogLoading />}>
        <BlogContent />
      </Suspense>
    </main>
  );
}