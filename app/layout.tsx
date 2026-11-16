import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import DateUI from './components/DateUI';
import NavBar from './components/navBar';
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'DevJournal — Engineering & Tech Insights',
    template: '%s | DevJournal',
  },
  description: 'Practical tutorials, architecture deep-dives, and notes on modern web development.',
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