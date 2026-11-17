'use client'; // Note: Client directive required for stateful image zoom modal

import { useState } from 'react';
import DateUI from '@/app/components/DateUI';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_NAME = 'Bikram Article';
const AUTHOR_NAME = 'Bikram Khadka';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';

export default function AboutPage() {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  // Schema.org Person markup
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
      'https://www.linkedin.com/in/dhurba-khadka-1a5b51357',
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
          <div className="relative group">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-neutral-950 shadow-md flex items-center justify-center border-2 border-neutral-200">
              <span className="absolute text-2xl font-black text-white">BK</span>
              <img
                src="/bikram_khadka.jpeg" 
                alt="Bikram Khadka"
                className="relative z-10 h-full w-full object-cover"
              />
            </div>
            {/* View Full Size Button Overlay */}
            <button
              type="button"
              onClick={() => setIsPhotoOpen(true)}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100 rounded-2xl text-white text-xs font-bold cursor-pointer"
            >
              🔍 View Full
            </button>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
              Software Engineer &amp; Creator
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
              Bikram Khadka
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              Also known as <strong className="text-neutral-800">Bikram Article</strong> · Living &amp; studying in Kobe, Hyogo, Japan
            </p>
          </div>
        </div>

        {/* Bio Body Content */}
        <div className="prose prose-neutral prose-lg mt-10 max-w-none space-y-6 text-neutral-600 leading-relaxed">
          <p>
            Hello! I am <strong className="text-neutral-900">Dhurba Bikram Khadka</strong> (known professionally as <strong className="text-neutral-900">Bikram Khadka</strong>), a passionate full-stack software engineer, backend developer, and digital creator. Currently based in <strong className="text-neutral-900">Kobe, Japan</strong>, I study in the DX Business Course at <strong className="text-neutral-900">Art College Kobe</strong>, focusing on scalable software architecture and digital business operations.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">Engineering Philosophy &amp; Tech Stack</h2>
          <p>
            My work centers on building high-performance, lightweight, and practical web applications. I specialize in modern backend and full-stack toolchains using Python (FastAPI, Django), TypeScript (Next.js, React), Java, and SQLite/PostgreSQL databases. I advocate for clean code, local-first workflows, and reliable system performance.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">About Bikram Article</h2>
          <p>
            <strong className="text-neutral-900">Bikram Article</strong> serves as my personal technical journal and knowledge hub. Here, I publish in-depth programming guides, architecture case studies, and engineering tutorials born from my hands-on development projects in Japan and Nepal.
          </p>

          {/* Social Links & Official IDs */}
          <h2 className="text-xl font-bold text-neutral-950 pt-6">Connect with Bikram</h2>
          <p className="text-sm text-neutral-500">
            You can find and connect with me across my official social media profiles and developer channels below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose pt-2">
            <a
              href="https://github.com/hakerbikram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">💻</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">GitHub</span>
                <span className="text-sm font-bold text-neutral-900">@hakerbikram</span>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/dhurba-khadka-1a5b51357"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">💼</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">LinkedIn</span>
                <span className="text-sm font-bold text-neutral-900">Dhurba Bikram Khadka</span>
              </div>
            </a>

            <a
              href="https://www.facebook.com/share/1BjMx25tg9/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">📘</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Facebook</span>
                <span className="text-sm font-bold text-neutral-900">Official Profile</span>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@dhurba..khadka?_r=1&_t=ZS-9BRgrec1EoL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className="text-xl">🎵</span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">TikTok</span>
                <span className="text-sm font-bold text-neutral-900">@dhurba..khadka</span>
              </div>
            </a>
          </div>
        </div>

        {/* Legal & Policy Navigation Links */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-neutral-200 pt-6 text-xs font-medium text-neutral-500">
          <Link href="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-blue-600 transition">Terms &amp; Guidelines</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-blue-600 transition">Contact &amp; Inquiries</Link>
        </div>

        {/* Footer Call to Action */}
        <div className="mt-6 border-t border-neutral-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <span>© <DateUI /> Bikram Khadka. All rights reserved.</span>
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            Explore Articles →
          </Link>
        </div>
      </div>

      {/* Full Size Photo Modal */}
      {isPhotoOpen && (
        <div 
          onClick={() => setIsPhotoOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 text-center">
            <button
              type="button"
              onClick={() => setIsPhotoOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold shadow hover:bg-neutral-700"
            >
              ✕
            </button>
            <img
              src="/bikram_khadka.jpeg"
              alt="Bikram Khadka Full Size"
              className="w-full max-h-[75vh] object-contain rounded-2xl mx-auto"
            />
            <p className="mt-3 text-sm font-bold text-neutral-900">Bikram Khadka</p>
            <p className="text-xs text-neutral-500">Kobe, Japan</p>
          </div>
        </div>
      )}
    </main>
  );
}