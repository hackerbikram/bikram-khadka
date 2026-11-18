import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import DateUI from './components/DateUI';
import NavBar from './components/navBar';
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] });
 

const SITE_URL = 'https://bikram-khadka.vercel.app';
const SITE_NAME = 'Bikram Article';
const AUTHOR_NAME = 'Dhurba Bikram Khadka';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bikram Article — Ideas & Insights by Bikram Khadka',
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Personal technical blog and software engineering insights covering full-stack development, Python, Next.js, and modern web architectures.',
  keywords: [
    'Bikram Khadka',
    'Bikram Article',
    'Software Engineering',
    'Full-Stack Development',
    'Python',
    'Next.js',
    'Tech Blog Japan',
    'AI',
    'How do',
  ],
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Bikram Article — Ideas & Insights by Bikram Khadka',
    description: 'Personal technical blog and software engineering insights covering full-stack development, Python, Next.js, and modern web architectures.',
    images: [
      {
        url: '/og-cover.png', // Place a 1200x630px preview image in your public/ folder
        width: 1200,
        height: 630,
        alt: 'Bikram Article - Tech Blog & Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bikram Article — Ideas & Insights by Bikram Khadka',
    description: 'Personal technical blog and software engineering insights covering full-stack development, Python, Next.js, and modern web architectures.',
    images: ['/og-cover.png'],
    creator: '@hackerbikram', // Update with your actual Twitter/X handle if you have one
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  verification: {
    google: 'naAmm34EXkw9DST7sXF1AKbbLR0fDJPxGW1cnz1k3pU',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-900 antialiased min-h-screen flex flex-col`}>
        <NavBar />
        <div className="flex-1">{children}</div>
        <Footer/>
      </body>
    </html>
  );
}