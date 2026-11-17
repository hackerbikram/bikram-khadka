import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the SDK (automatically picks up process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI();

// Define the schema so Gemini strictly returns JSON matching this shape
const blogPostSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Catchy, SEO-optimized blog post title' },
    slug: { type: Type.STRING, description: 'URL-friendly slug (e.g., building-ai-agents)' },
    seoDescription: { type: Type.STRING, description: 'Meta description under 160 characters' },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: '3 to 5 relevant technical tags' 
    },
    markdownContent: { 
      type: Type.STRING, 
      description: 'The complete blog post written in professional Markdown with headings, lists, and code snippets.' 
    },
  },
  required: ['title', 'slug', 'seoDescription', 'tags', 'markdownContent'],
};

export async function generateBlogPost(topic: string, audience: string) {
  const prompt = `Write a comprehensive, technical, and highly engaging blog post about: "${topic}". Target Audience: ${audience}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert technical writer and developer.',
      responseMimeType: 'application/json',
      responseSchema: blogPostSchema,
      temperature: 0.7,
    },
  });

  if (!response.text) {
    throw new Error('Failed to generate blog post from Gemini.');
  }

  // Parse the strict JSON response returned by Gemini
  return JSON.parse(response.text) as {
    title: string;
    slug: string;
    seoDescription: string;
    tags: string[];
    markdownContent: string;
  };
}