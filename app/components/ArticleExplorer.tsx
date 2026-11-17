'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Post } from '@/app/lib/db';
import { getLike } from '../actions/engagementAction';

interface ArticleExplorerProps {
  posts: Post[];
}

function formatDate(date: string | Date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently published';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Isolated Card component to fetch and display real-time like counts per post
 */
function ArticleCard({ post, index, onTagClick }: { post: Post; index: number; onTagClick: (tag: string) => void }) {
  const [likes, setLikes] = useState<number>(post.like ?? 0);

  useEffect(() => {
    let isMounted = true;
    getLike(String(post.id)).then((count) => {
      if (isMounted) setLikes(count);
    });
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const category = post.category?.trim() || 'General';
  const postTags = post.tags
    ? post.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <article
      className="group flex min-h-[310px] flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          {category}
        </span>
        <span className="text-xs font-medium text-neutral-300">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-neutral-950 transition-colors group-hover:text-blue-600 sm:text-2xl">
          <Link href={`/posts/${encodeURIComponent(post.slug)}`}>
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-500">
          {post.excerpt}
        </p>
      </div>

      {postTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {postTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 transition hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 font-mono text-xs text-neutral-500">
        <span>👁️ {post.views ?? 0} views</span>
        <span>·</span>
        <span>❤️ {likes} likes</span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex flex-col gap-0.5">
          <time className="text-xs font-semibold text-neutral-700">
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

export default function ArticleExplorer({ posts }: ArticleExplorerProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Keep query in sync if URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  // Extract unique categories and popular tags
  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category?.trim() || 'General'));
    return ['All', ...Array.from(set)];
  }, [posts]);

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      if (!post.tags) continue;
      for (const raw of post.tags.split(',')) {
        const tag = raw.trim();
        if (tag) counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [posts]);

  // Instant client-side filtering
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const cat = post.category?.trim() || 'General';
      const matchesCategory =
        selectedCategory === 'All' || cat === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const inTitle = post.title.toLowerCase().includes(q);
      const inExcerpt = post.excerpt?.toLowerCase().includes(q);
      const inCategory = cat.toLowerCase().includes(q);
      const inTags = post.tags?.toLowerCase().includes(q);

      return inTitle || inExcerpt || inCategory || inTags;
    });
  }, [posts, query, selectedCategory]);

  return (
    <section
      id="articles"
      className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-24 pt-16 sm:px-8 lg:px-12"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
            Instant Discovery
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            Explore articles
          </h2>
        </div>

        {/* Instant Search Input */}
        <div className="relative w-full lg:w-96">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, #tag, or topic..."
            aria-label="Search articles by title, tag, or topic"
            className="w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-11 pr-10 text-sm text-neutral-950 shadow-2xs placeholder:text-neutral-400 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            🔍
          </span>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-0.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                active
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Popular Hashtags Bar */}
      {popularTags.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Trending tags:
          </span>
          {popularTags.map((tag) => {
            const isSelected = query.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(isSelected ? '' : tag)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between text-xs font-semibold text-neutral-400">
        <span>
          SHOWING {filteredPosts.length} OF {posts.length}{' '}
          {posts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
        </span>
        {(query || selectedCategory !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Filtered Results Grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-neutral-900">
            No matching articles found
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Try searching for another keyword, tag, or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="mt-5 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600 cursor-pointer"
          >
            Show all articles
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <ArticleCard
              key={post.id}
              post={post}
              index={index}
              onTagClick={(tag) => setQuery(tag)}
            />
          ))}
        </div>
      )}
    </section>
  );
}