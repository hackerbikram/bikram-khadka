import Link from 'next/link';
import { Suspense } from 'react';
import { db, initDb, type Post } from '@/app/lib/db';
import type { Metadata } from 'next';

// ==================================================
// CONFIGURATION
// ==================================================

const SITE_NAME = 'Bikram';
const SITE_DESCRIPTION =
  'Explore practical insights on software development, technology, programming and business innovation.';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const POSTS_PER_PAGE = 12;

// ==================================================
// SEO METADATA
// ==================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    absolute: 'Bikram — Technology, Development & Business Insights',
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  keywords: [
    'software development',
    'technology',
    'programming tutorials',
    'Python tutorials',
    'JavaScript tutorials',
    'Next.js',
    'web development',
    'business technology',
    'digital innovation',
  ],

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: 'Bikram — Technology, Development & Business Insights',
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Bikram — Technology & Business',
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

// ==================================================
// HELPERS
// ==================================================

function formatDate(date: string | Date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently published';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function getISODate(date: string | Date) {
  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? undefined
    : parsed.toISOString();
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

// ==================================================
// DATABASE
// ==================================================

async function getPublishedPosts(): Promise<Post[]> {
  await initDb();

  const result = await db.execute(
    `SELECT
      id,
      title,
      slug,
      excerpt,
      category,
      readingTime,
      views,
      "like",
      createdAt
    FROM posts
    WHERE published = 1
    ORDER BY createdAt DESC
    LIMIT ${POSTS_PER_PAGE}`
  );

  return result.rows as unknown as Post[];
}

// ==================================================
// REUSABLE COMPONENTS
// ==================================================

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

      <time
        dateTime={getISODate(date)}
        className="font-medium text-neutral-400"
      >
        {formatDate(date)}
      </time>

      <span className="text-neutral-300">·</span>

      <span className="font-medium text-neutral-400">
        {readingTime} min read
      </span>

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

// ==================================================
// HERO
// ==================================================

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[450px] w-[450px] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Technology · Development · Business
          </div>

          <h1 className="text-5xl font-black leading-[1.06] tracking-[-0.065em] text-neutral-950 sm:text-6xl lg:text-[76px]">
            Ideas worth
            <br />
            <span className="text-blue-600">understanding.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
            Exploring software engineering, technology and smarter
            business solutions. Practical tutorials, original ideas
            and knowledge built through real-world experience.
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
          <span>02 — Technology</span>
          <span>03 — Business Innovation</span>
        </div>
      </div>
    </section>
  );
}

// ==================================================
// FEATURED ARTICLE
// ==================================================

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

              <span className="ml-2 text-sm text-neutral-400">
                min read
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

// ==================================================
// CATEGORY NAVIGATION
// ==================================================

function TopicNavigation({
  categories,
}: {
  categories: string[];
}) {
  if (!categories.length) return null;

  return (
    <section
      id="topics"
      className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-20 sm:px-8 lg:px-12"
    >
      <SectionHeading
        eyebrow="Discover"
        title="Explore topics"
        description="Find articles by subject and explore the topics that interest you."
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

// ==================================================
// ARTICLE CARD
// ==================================================

function ArticleCard({
  post,
  index,
  anchorId,
}: {
  post: Post;
  index: number;
  anchorId?: string;
}) {
  const category = post.category?.trim() || 'General';

  return (
    <article
      id={anchorId}
      className="group flex min-h-[310px] flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          {category}
        </span>

        <span className="text-xs font-medium text-neutral-300">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-7 flex-1">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-neutral-950 transition-colors group-hover:text-blue-600 sm:text-2xl">
          <Link href={`/posts/${encodeURIComponent(post.slug)}`}>
            {post.title}
          </Link>
        </h3>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-neutral-500">
          {post.excerpt || 'Read this article to discover useful insights and practical information.'}
        </p>
      </div>

      {/* Live Views & Likes Badges */}
      <div className="mt-6 flex items-center gap-3 text-xs font-mono text-neutral-500">
        <span>👁️ {post.views ?? 0} views</span>
        <span>·</span>
        <span>❤️ {post.like ?? 0} likes</span>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5">
        <div className="flex flex-col gap-1">
          <time
            dateTime={getISODate(post.createdAt)}
            className="text-xs font-semibold text-neutral-700"
          >
            {formatDate(post.createdAt)}
          </time>

          <span className="text-[11px] text-neutral-400">
            {post.readingTime || 1} min read
          </span>
        </div>

        <Link
          href={`/posts/${encodeURIComponent(post.slug)}`}
          aria-label={`Read ${post.title}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-lg transition group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white"
        >
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

// ==================================================
// EMPTY STATE
// ==================================================

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl">
        ✍️
      </div>

      <h3 className="mt-6 text-xl font-bold">
        Your story starts here.
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
        There are no published articles yet. Start creating useful
        content and your articles will appear here.
      </p>

      <Link
        href="/create"
        className="mt-7 inline-flex rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Create your first article →
      </Link>
    </div>
  );
}

// ==================================================
// SEO STRUCTURED DATA
// ==================================================

function BlogStructuredData({ posts }: { posts: Post[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: 'Bikram',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || SITE_DESCRIPTION,
      url: `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`,
      ...(getISODate(post.createdAt)
        ? { datePublished: getISODate(post.createdAt) }
        : {}),
      author: {
        '@type': 'Person',
        name: 'Bikram',
      },
      ...(post.category
        ? { articleSection: post.category }
        : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(structuredData),
      }}
    />
  );
}

// ==================================================
// DATABASE CONTENT
// ==================================================

async function BlogContent() {
  const posts = await getPublishedPosts();

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  const categories = Array.from(
    new Set(
      posts
        .map((post) => post.category?.trim() || 'General')
        .filter(Boolean)
    )
  );

  const featuredCategory =
    featuredPost?.category?.trim() || 'General';

  const anchorOwner = new Map<string, string>();

  for (const category of categories) {
    if (featuredPost && category === featuredCategory) {
      anchorOwner.set(category, String(featuredPost.id));
      continue;
    }

    const firstPost = latestPosts.find(
      (post) => (post.category?.trim() || 'General') === category
    );

    if (firstPost) {
      anchorOwner.set(category, String(firstPost.id));
    }
  }

  return (
    <>
      <BlogStructuredData posts={posts} />

      {/* FEATURED ARTICLE */}
      {featuredPost && (
        <FeaturedArticle post={featuredPost} />
      )}

      {/* TOPICS */}
      <TopicNavigation categories={categories} />

      {/* LATEST ARTICLES */}
      <section
        id="articles"
        className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-24 pt-20 sm:px-8 lg:px-12"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The journal"
            title="Latest articles"
            description="Fresh ideas, technical guides and practical knowledge."
          />

          <span className="text-xs font-semibold text-neutral-400">
            {posts.length} {posts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
          </span>
        </div>

        {posts.length === 0 ? (
          <EmptyState />
        ) : latestPosts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-sm text-neutral-500">
              You have read the latest article. More articles are coming soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => {
              const category = post.category?.trim() || 'General';

              const ownsAnchor =
                anchorOwner.get(category) === String(post.id);

              return (
                <ArticleCard
                  key={post.id}
                  post={post}
                  index={index + 2}
                  anchorId={ownsAnchor ? categoryId(category) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

// ==================================================
// SUSPENSE FALLBACK
// ==================================================

function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-5 py-20 sm:px-8 lg:px-12">
      <div className="animate-pulse rounded-[28px] border border-neutral-200 bg-white p-8 sm:p-12">
        <div className="h-5 w-32 rounded-full bg-neutral-100" />
        <div className="mt-8 h-10 max-w-2xl rounded-lg bg-neutral-100" />
        <div className="mt-4 h-5 max-w-xl rounded-lg bg-neutral-100" />
        <div className="mt-4 h-5 max-w-md rounded-lg bg-neutral-100" />
        <div className="mt-9 h-5 w-40 rounded-lg bg-neutral-100" />
      </div>

      <div>
        <div className="h-8 w-52 animate-pulse rounded-lg bg-neutral-100" />

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[290px] animate-pulse rounded-2xl border border-neutral-200 bg-white p-7"
            >
              <div className="h-6 w-24 rounded-full bg-neutral-100" />
              <div className="mt-9 h-7 w-full rounded-lg bg-neutral-100" />
              <div className="mt-4 h-5 w-4/5 rounded-lg bg-neutral-100" />
              <div className="mt-4 h-5 w-3/5 rounded-lg bg-neutral-100" />
              <div className="mt-12 h-8 w-full rounded-lg bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================================================
// MAIN PAGE
// ==================================================

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