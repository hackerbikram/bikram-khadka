import type { Metadata } from 'next';
import Link from 'next/link';
import DateUI from '@/app/components/DateUI';

const SITE_NAME = 'Bikram Article';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';

export const metadata: Metadata = {
  title: `Terms & Guidelines — ${SITE_NAME}`,
  description: `Terms of use, intellectual property guidelines, and code of conduct for Bikram Article by Bikram Khadka.`,
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-16 text-neutral-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/about"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
        >
          <span>←</span> Back to About
        </Link>

        <header className="mb-10 border-b border-neutral-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
            Legal &amp; Usage
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
            Terms &amp; Guidelines
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: <DateUI />
          </p>
        </header>

        <div className="prose prose-neutral prose-lg max-w-none space-y-6 text-neutral-600 leading-relaxed">
          <p>
            Welcome to <strong className="text-neutral-900">Bikram Article</strong> (<code className="text-xs bg-neutral-100 p-1 rounded">bikram-khadka.vercel.app</code>). By accessing and using this website, you agree to comply with and be bound by the following terms and guidelines.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">1. Intellectual Property &amp; Content</h2>
          <p>
            All articles, code snippets, tutorials, text, graphics, and visual media published on this platform are authored by <strong className="text-neutral-900">Bikram Khadka</strong> unless otherwise stated. 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You are welcome to read, share, and reference articles for personal and educational purposes.
            </li>
            <li>
              Commercial redistribution, bulk scraping, or republishing full articles without explicit written permission is strictly prohibited.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">2. User Interactions &amp; Engagement</h2>
          <p>
            Features such as article likes and view tracking are provided to enhance reader experience. You agree not to abuse, automate, or exploit engagement mechanisms (such as automated script liking) to manipulate interaction metrics.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">3. Disclaimer of Warranties</h2>
          <p>
            The tutorials, code implementations, and technical guides provided on this site are for informational and educational purposes. While every effort is made to ensure accuracy, code examples and guides are provided <q>as is</q> without warranty of any kind. I am not liable for any system errors, data loss, or issues arising from the implementation of provided code or tutorials.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">4. External Links</h2>
          <p>
            This website references external repositories (GitHub), professional platforms (LinkedIn), and social media channels. I do not assume responsibility for the content, availability, or security practices of external sites.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">5. Contact &amp; Inquiries</h2>
          <p>
            For any questions regarding these terms, collaboration proposals, or licensing inquiries, please reach out via the official channels listed on my <Link href="/about" className="text-blue-600 hover:underline">About page</Link>.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-neutral-200 pt-8 flex items-center justify-between text-xs text-neutral-400">
          <span>© <DateUI /> Bikram Khadka. All rights reserved.</span>
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            Home →
          </Link>
        </div>
      </div>
    </main>
  );
}