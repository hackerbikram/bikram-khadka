import DateUI from '@/app/components/DateUI';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_NAME = 'Bikram Article';
const AUTHOR_NAME = 'Bikram Khadka';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';

export const metadata: Metadata = {
  title: `About ${AUTHOR_NAME} — Software Engineer & Creator`,
  description: `Learn more about Bikram Khadka (Bikram Khadka / Bikram Article) — software engineering student in Kobe, Japan, full-stack developer, and creator.`,
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: `About ${AUTHOR_NAME} — Software Engineer & Creator`,
    description: `Official bio of Bikram Khadka. Discover his background in software engineering, tech stack, and projects.`,
    url: `${SITE_URL}/about`,
    type: 'profile',
  },
};

export default function AboutPage() {
  // Schema.org Person markup to help Google associate your name with your social profiles
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: SITE_URL,
    jobTitle: 'Full-Stack Software Developer & Student',
    worksFor: {
      '@type': 'Organization',
      name: 'Bikram Article',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Art College Kobe',
    },
    sameAs: [
      'https://github.com/hakerbikram',
      'https://www.linkedin.com/in/dhurba-khadka-1a5b51357?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
      'https://www.facebook.com/share/1BjMx25tg9/?mibextid=wwXIfr',
      'https://www.tiktok.com/@dhurba..khadka?_r=1&_t=ZS-9BRgrec1EoL',
    ],
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-16 text-neutral-900 sm:px-8 lg:px-12">
      {/* XSS-Safe JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
        >
          <span>←</span> Back to Journal
        </Link>

        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-neutral-200 pb-10">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-neutral-950 shadow-md flex items-center justify-center">
            {/* Fallback initials displayed behind in case image fails to load */}
            <span className="absolute text-2xl font-black text-white">BK</span>
            <img
              src="https://www.facebook.com/share/1E5gYjdHyt/?mibextid=wwXIfr" 
              alt="Bikram Khadka"
              className="relative z-10 h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
              Software Engineer &amp; Creator
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
              Bikram Khadka
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              Also known as <strong className="text-neutral-800">Bikram Article</strong> · Living &amp; studying in Kobe, Japan
            </p>
          </div>
        </div>

        {/* Bio Body Content */}
        <div className="prose prose-neutral prose-lg mt-10 max-w-none space-y-6 text-neutral-600 leading-relaxed">
          <p>
            Hello! I am <strong className="text-neutral-900">Bikram Khadka</strong>, a passionate full-stack software developer, digital creator, and technology enthusiast. Currently based in <strong className="text-neutral-900">Kobe, Hyogo, Japan</strong>, I am studying digital transformation and advanced software development at Art College Kobe.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">Background &amp; Expertise</h2>
          <p>
            My engineering philosophy centers around building fast, lightweight, and practical software solutions that solve real-world operational problems. I specialize in backend architecture and full-stack web applications using modern tools like Python, FastAPI, Django, Next.js, TypeScript, and SQLite (Turso).
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">About Bikram Article</h2>
          <p>
            <strong className="text-neutral-900">Bikram Article</strong> is my personal technical journal and knowledge base. Here, I document programming tutorials, web engineering guides, and business technology insights gained through hands-on development and real-world projects.
          </p>

          {/* Social Links & Official IDs */}
          <h2 className="text-xl font-bold text-neutral-950 pt-6">Connect with Bikram</h2>
          <p className="text-sm text-neutral-500">
            You can find and connect with me across my official social media profiles and developer channels below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose pt-2">
            <a
              href="https://github.com/bikramkhadka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">💻</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">GitHub</span>
                <span className="text-sm font-bold text-neutral-900">@bikramkhadka</span>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/bikramkhadka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">💼</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">LinkedIn</span>
                <span className="text-sm font-bold text-neutral-900">Bikram Khadka</span>
              </div>
            </a>

            <a
              href="https://www.facebook.com/bikramkhadka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">📘</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Facebook ID</span>
                <span className="text-sm font-bold text-neutral-900">facebook.com/bikramkhadka</span>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@bikramkhadka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">🎵</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">TikTok ID</span>
                <span className="text-sm font-bold text-neutral-900">@bikramkhadka</span>
              </div>
            </a>
          </div>
        </div>

        {/* Footer Call to Action */}
        <div className="mt-16 border-t border-neutral-200 pt-8 flex items-center justify-between text-xs text-neutral-400">
          <span>© <DateUI /> Bikram Khadka. All rights reserved.</span>
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            Explore Articles →
          </Link>
        </div>
      </div>
    </main>
  );
}