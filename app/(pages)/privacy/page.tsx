import type { Metadata } from 'next';
import Link from 'next/link';
import DateUI from '@/app/components/DateUI';

const SITE_NAME = 'Bikram Article';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikram-khadka.vercel.app';

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: `Privacy policy and data handling practices for Bikram Article by Bikram Khadka.`,
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
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
            Legal &amp; Compliance
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: <DateUI />
          </p>
        </header>

        <div className="prose prose-neutral prose-lg max-w-none space-y-6 text-neutral-600 leading-relaxed">
          <p>
            Welcome to <strong className="text-neutral-900">Bikram Article</strong> (<code className="text-xs bg-neutral-100 p-1 rounded">bikram-khadka.vercel.app</code>). Your privacy is important to me. This Privacy Policy outlines what information is collected when you visit this website and how it is used.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">1. Information Collected</h2>
          <p>
            This website is designed with a minimalist and privacy-first approach. 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Engagement &amp; Likes:</strong> When you like an article, a secure, anonymous visitor token cookie (<code className="text-xs bg-neutral-100 p-1 rounded">visitor_token</code>) is stored in your browser. This token is used solely to remember whether you have liked an article, preventing duplicate counts.
            </li>
            <li>
              <strong>Analytics &amp; Views:</strong> Article view counts and interaction metrics are recorded anonymously to display overall reader engagement. No personally identifiable tracking data is sold or shared with third-party advertisers.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">2. Cookies</h2>
          <p>
            Cookies are small text files stored on your device. This site uses only essential cookies required for core functionality, specifically managing your anonymous visitor identifier for article likes. You can clear or block cookies at any time through your browser settings.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">3. Third-Party Links</h2>
          <p>
            This website contains links to external platforms such as GitHub, LinkedIn, Facebook, and TikTok. Clicking on these links will direct you to third-party sites governed by their own respective privacy policies. I am not responsible for the privacy practices of external websites.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">4. Data Security</h2>
          <p>
            All data interactions (such as view increments and likes) are processed securely via encrypted connections. Database storage is handled securely with strict access controls.
          </p>

          <h2 className="text-xl font-bold text-neutral-950 pt-4">5. Contact</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, you can reach out directly via my official <Link href="/about" className="text-blue-600 hover:underline">About page</Link> and connected professional profiles.
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