'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { db, initDb } from '@/app/lib/db';

const ai = new GoogleGenAI();

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

const blogPostSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Catchy, SEO-optimized blog post title' },
    slug: { type: Type.STRING, description: 'URL-friendly slug' },
    excerpt: { type: Type.STRING, description: '1-2 sentence compelling summary' },
    content: { type: Type.STRING, description: 'Complete, deep-dive Markdown article with code examples and H2/H3 headers' },
    category: { type: Type.STRING, description: 'Single primary category (e.g., Web Development, AI, Software Architecture)' },
    tags: { type: Type.STRING, description: 'Comma-separated tags (e.g., nextjs, gemini, typescript)' },
    metaTitle: { type: Type.STRING, description: 'SEO title tag (max 60 chars)' },
    metaDescription: { type: Type.STRING, description: 'SEO meta description (max 155 chars)' },
  },
  required: ['title', 'slug', 'excerpt', 'content', 'category', 'tags', 'metaTitle', 'metaDescription'],
};

export async function generateTrendingPostAction() {
  try {
    await initDb();

    // 1. Fetch existing posts to avoid duplicates
    const existingPostsResult = await db.execute({
      sql: 'SELECT title, slug FROM posts ORDER BY createdAt DESC LIMIT 50',
      args: [],
    });

    const existingTitles = existingPostsResult.rows.map((r) => String(r.title));
    const existingSlugs = new Set(existingPostsResult.rows.map((r) => String(r.slug)));

    const exclusionList = existingTitles.length > 0
      ? existingTitles.map((t) => `- ${t}`).join('\n')
      : 'None yet.';

    // 2. COMBINED: Single-call search grounding & structured generation to save quota
    const prompt = `
    Search the web for what is currently trending right now in Full-stack web development, AI engineering, and modern software tools.
    Pick ONE high-value, timely topic that developers are actively discussing or searching for today.

    CRITICAL RULE: You MUST NOT pick a topic that overlaps with or duplicates any of these already-published articles on my blog:
    ${exclusionList}

    Write a comprehensive, production-grade technical blog post based on your live search findings. 
    Ensure it covers a completely unique angle compared to the exclusion list above.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are a senior software engineer writing authoritative, practical Markdown tutorials and tech insights.',
        responseMimeType: 'application/json',
        responseSchema: blogPostSchema,
        temperature: 0.6,
      },
    });

    if (!response.text) throw new Error('Failed to generate article from AI model.');

    const parsed = JSON.parse(response.text);

    let finalSlug = slugify(parsed.slug || parsed.title) || `post-${Date.now()}`;
    if (existingSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = calculateReadingTime(parsed.content);

    return {
      success: true,
      post: {
        ...parsed,
        slug: finalSlug,
        readingTime,
      },
    };
  } catch (error) {
    console.error('Generation action error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: message.includes('429') 
        ? 'Quota exceeded (429). Please wait a moment or check your Google AI Studio plan limits.' 
        : message 
    };
  }
}

export async function publishPostAction(previewPost: any) {
  try {
    await initDb();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO posts 
            (title, slug, excerpt, content, coverImage, category, tags, metaTitle, metaDescription, readingTime, published, views, like, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?)`,
      args: [
        previewPost.title,
        previewPost.slug,
        previewPost.excerpt,
        previewPost.content,
        null,
        previewPost.category,
        previewPost.tags,
        previewPost.metaTitle,
        previewPost.metaDescription,
        previewPost.readingTime,
        now,
        now,
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Publish action error:', error);
    return { success: false, error: 'Failed to save post to database.' };
  }
}