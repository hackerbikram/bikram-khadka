'use client';

import { useState, useMemo } from 'react';

interface ArticleEditorStudioProps {
  initialTitle?: string;
  initialContent?: string;
  initialExcerpt?: string;
}

const PREDEFINED_CATEGORIES = ['Engineering', 'Next.js', 'Python', 'Business', 'Design'];

export default function ArticleEditorStudio({
  initialTitle = '',
  initialContent = '',
  initialExcerpt = '',
}: ArticleEditorStudioProps) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState('nextjs, design, css');

  // Category Selection States
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>('Engineering');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  // Resolved final category value
  const category = selectedCategoryOption === 'Other' ? (customCategoryInput.trim() || 'General') : selectedCategoryOption;

  // Content Mode Toggle ('simple' vs 'html')
  const [contentMode, setContentMode] = useState<'simple' | 'html'>('simple');

  // Live Style Customization States
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [accentColor, setAccentColor] = useState<'blue' | 'purple' | 'emerald' | 'amber'>('blue');
  const [customCss, setCustomCss] = useState<string>('/* Add custom CSS styles here */\nh2 { letter-spacing: -0.03em; }');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');

  // Dynamic CSS mappings
  const fontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }[fontFamily];

  const sizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[fontSize];

  const accentColorHex = {
    blue: '#2563eb',
    purple: '#7c3aed',
    emerald: '#059669',
    amber: '#d97706',
  }[accentColor];

  // Render processed content based on active mode
  const renderedContentHtml = useMemo(() => {
    if (!content) return '<p class="text-neutral-400">Start typing content to see live preview...</p>';

    if (contentMode === 'html') {
      // Raw HTML mode: render exact markup as typed
      return content;
    }

    // Simple markdown / text mode
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-3">$3</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  }, [content, contentMode]);

  return (
    <div className="space-y-6">
      {/* Studio Toolbar */}
      <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">View Mode:</span>
          <div className="flex rounded-xl bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'edit' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Editor Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'split' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'preview' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {/* Style Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none"
          >
            <option value="sans">Sans Font</option>
            <option value="serif">Serif Font</option>
            <option value="mono">Mono Font</option>
          </select>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none"
          >
            <option value="sm">Small Text</option>
            <option value="base">Normal Text</option>
            <option value="lg">Large Text</option>
          </select>

          <div className="flex items-center gap-1.5">
            {(['blue', 'purple', 'emerald', 'amber'] as const).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAccentColor(color)}
                className={`h-5 w-5 rounded-full border-2 transition ${
                  accentColor === color ? 'border-neutral-950 scale-110' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: {
                    blue: '#2563eb',
                    purple: '#7c3aed',
                    emerald: '#059669',
                    amber: '#d97706',
                  }[color],
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className={`grid gap-6 ${activeTab === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Pane */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Content &amp; HTML Editor</h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Category Dropdown & 'Other' conditional input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                <select
                  value={selectedCategoryOption}
                  onChange={(e) => setSelectedCategoryOption(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none"
                >
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other (Custom)...</option>
                </select>

                {/* Show text input when 'Other' is selected */}
                {selectedCategoryOption === 'Other' && (
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Enter custom category..."
                    className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 animate-fadeIn"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Tags</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none resize-none"
              />
            </div>

            {/* Content Mode Toggle & Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-600">
                  Content Editor
                </label>
                <div className="flex rounded-lg bg-neutral-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setContentMode('simple')}
                    className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
                      contentMode === 'simple' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Simple Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentMode('html')}
                    className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
                      contentMode === 'html' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Styled HTML Mode
                  </button>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder={
                  contentMode === 'html'
                    ? '<div class="p-6 bg-blue-50 rounded-2xl border border-blue-200">\n  <h3 class="text-lg font-bold text-blue-900">Custom HTML Block</h3>\n  <p class="text-blue-700">Write custom styled HTML here...</p>\n</div>'
                    : '## Introduction\n\nWrite your markdown content here...'
                }
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-mono text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Custom CSS Injection</label>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                rows={4}
                placeholder="/* Add CSS rules to test styles live */"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-900 p-4 font-mono text-xs text-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-md">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Live Preview</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                {category}
              </span>
            </div>

            {/* Injected Custom CSS for live preview */}
            <style dangerouslySetInnerHTML={{ __html: customCss }} />

            <article className={`space-y-6 ${fontClass} ${sizeClass} text-neutral-800`}>
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950"
                style={{ color: accentColorHex }}
              >
                {title || 'Untitled Article'}
              </h1>

              {excerpt && (
                <p className="text-base sm:text-lg font-medium text-neutral-500 italic border-l-4 pl-4" style={{ borderColor: accentColorHex }}>
                  {excerpt}
                </p>
              )}

              {/* Live Rendered Content */}
              <div
                className="prose prose-neutral max-w-none pt-4 space-y-4"
                dangerouslySetInnerHTML={{ __html: renderedContentHtml }}
              />
            </article>
          </div>
        )}
      </div>
    </div>
  );
}