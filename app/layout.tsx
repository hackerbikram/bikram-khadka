import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import DateUI from './components/DateUI';
import NavBar from './components/navBar';
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bikram-khadka.vercel.app'),
  title: {
    default: 'Bikram Article — Ideas & Insights by Bikram Khadka',
    template: '%s | Bikram Article',
  },
  description: 'Personal technical blog and software engineering insights by Bikram Khadka.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  verification: {
    google: 'naAmm34EXkw9DST7sXF1AKbbLR0fDJPxGW1cnz1k3pU',
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