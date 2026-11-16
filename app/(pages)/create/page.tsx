import Link from 'next/link';
import ArticleEditorStudio from '@/app/components/ArticleEditorStudio';

export default function CreatePage() {
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
          Write content, inject custom HTML/CSS, tweak typography fonts live, and see instant previews.
        </p>
      </div>

      <ArticleEditorStudio />
    </main>
  );
}