import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, initDb } from '@/app/lib/db';

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

    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const category = (formData.get('category') as string) || 'General';
    const tags = (formData.get('tags') as string) || '';
    const coverImage = (formData.get('coverImage') as string) || null;
    const metaTitle = (formData.get('metaTitle') as string) || null;
    const metaDescription = (formData.get('metaDescription') as string) || null;

    let slug = slugify(title);
    
    // Check if slug exists to avoid uniqueness collisions
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
    <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
          Create New Article
        </h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">
          Draft a post with full Markdown support, metadata configuration, and instant publishing.
        </p>
      </div>

      <form action={savePost} className="space-y-8">
        {/* Primary Content Section */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            Article Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Why SQLite Scales for Modern Apps" 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Category
              </label>
              <input 
                name="category" 
                placeholder="e.g. Engineering, Architecture" 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
              Excerpt / Summary <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="excerpt" 
              required 
              rows={3}
              placeholder="A brief 1-2 sentence overview shown on your homepage feed..." 
              className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all resize-none" 
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Cover Image URL <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input 
                name="coverImage" 
                type="url" 
                placeholder="https://images.unsplash.com/..." 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Tags <span className="text-neutral-400 font-normal">(Comma separated)</span>
              </label>
              <input 
                name="tags" 
                placeholder="nextjs, sqlite, turso, database" 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
              Content <span className="text-neutral-400 font-normal">(Markdown Supported)</span> <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="content" 
              placeholder="## Introduction&#10;&#10;Write your main article content here..." 
              rows={14} 
              required 
              className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl p-4 text-neutral-900 placeholder:text-neutral-400 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
            />
          </div>
        </div>

        {/* SEO Collapsible Panel */}
        <details className="group bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <summary className="flex items-center justify-between cursor-pointer font-semibold text-neutral-900 select-none">
            <span className="flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-5 h-5 text-neutral-500 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced SEO Overrides
            </span>
            <span className="text-xs font-normal text-neutral-400">Optional</span>
          </summary>
          
          <div className="mt-6 pt-6 border-t border-neutral-100 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Custom Meta Title
              </label>
              <input 
                name="metaTitle" 
                placeholder="Leave blank to automatically use the article title" 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Custom Meta Description
              </label>
              <textarea 
                name="metaDescription" 
                rows={2} 
                placeholder="Leave blank to automatically use the excerpt" 
                className="w-full bg-neutral-50/50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all resize-none" 
              />
            </div>
          </div>
        </details>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="bg-neutral-950 text-white px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-sm"
          >
            Publish Article
          </button>
        </div>
      </form>
    </main>
  );
}