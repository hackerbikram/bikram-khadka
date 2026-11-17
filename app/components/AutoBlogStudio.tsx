'use client';

import { useState } from 'react';
import { generateTrendingPostAction, publishPostAction } from '@/app/actions/autoBlogAction';

interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
}

export function AutoBlogStudio() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewPost, setPreviewPost] = useState<GeneratedPost | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (loading) return; // Prevent double-clicks entirely
    setLoading(true);
    setStatusMessage('AI Agent is researching trending topics...');

    try {
      const res = await generateTrendingPostAction();
      if (!res.success || !res.post) {
        throw new Error(res.error || 'Failed to generate post.');
      }

      setPreviewPost(res.post);
      setStatusMessage('Ready for review!');
    } catch (error) {
      console.error(error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPublish() {
    if (!previewPost) return;
    setSaving(true);

    try {
      const res = await publishPostAction(previewPost);
      if (!res.success) {
        throw new Error(res.error);
      }

      alert('Successfully published to your live blog!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to save post to database.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Trigger Button */}
      <div className="flex flex-col items-start gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="relative group px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 bg-black text-white border-2 border-transparent disabled:opacity-60 overflow-hidden before:absolute before:inset-0 before:-z-10 before:p-[2px] before:rounded-full before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-500 before:opacity-70 group-hover:before:opacity-100 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2.5 relative z-10">
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span>{statusMessage}</span>
              </>
            ) : (
              <span>✨ AI Agent: Research & Generate Post</span>
            )}
          </span>
        </button>
      </div>

      {/* Preview Modal / Card */}
      {previewPost && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                {previewPost.category}
              </span>
              <h2 className="text-xl font-bold text-neutral-900 mt-2">{previewPost.title}</h2>
              <p className="text-xs text-neutral-500 mt-1">Slug: /{previewPost.slug} • Est. {previewPost.readingTime} min read</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-4 py-2 text-sm border border-neutral-300 rounded-xl hover:bg-neutral-100 cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={saving}
                className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Publishing...' : '🚀 Publish to Live Blog'}
              </button>
            </div>
          </div>

          <div className="space-y-4 text-sm text-neutral-700 max-h-96 overflow-y-auto pr-2">
            <div>
              <h4 className="font-semibold text-neutral-900">Excerpt:</h4>
              <p className="italic text-neutral-600">{previewPost.excerpt}</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Tags:</h4>
              <p className="font-mono text-xs bg-neutral-100 p-2 rounded">{previewPost.tags}</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Markdown Content Preview:</h4>
              <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                {previewPost.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}