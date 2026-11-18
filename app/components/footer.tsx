"use client"

import Link from "next/link";
import DateUI from "./DateUI";
import ShareButton from "./shareButton";
export default function Footer() {
  const handleShare = () => {
  // Copies the exact current page URL (e.g., https://bikram-khadka.vercel.app/posts/my-article)
  const currentUrl = window.location.href; 
  
  navigator.clipboard.writeText(currentUrl);
  alert("Link copied to clipboard!");
};
  return (
    <footer className="border-t border-neutral-200 bg-white">

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">

        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">

          <div>
            <Link href="/" className="text-xl font-black tracking-tight">
              Bikram<span className="text-blue-600">.</span>
            </Link>

            <p className="mt-2 text-xs text-neutral-400">
              Technology, development and business insights.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-6 text-xs font-medium text-neutral-500"
          >
            <Link href="/" className="transition hover:text-blue-600">
              Home
            </Link>

            <Link href="/#articles" className="transition hover:text-blue-600">
              Articles
            </Link>

            <Link href="/#topics" className="transition hover:text-blue-600">
              Topics
            </Link>

            <Link href="/create" className="transition hover:text-blue-600">
              Write
            </Link>
          </nav>

          <ShareButton />

        </div>

        <div className="mt-9 border-t border-neutral-100 pt-6 text-xs text-neutral-400">
          © <DateUI/> Bikram Khadka. All rights reserved.
        </div>

      </div>

    </footer>
  );
}