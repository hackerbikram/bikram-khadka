'use client'
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">

        <Link
          href="/"
          aria-label="Bikram home"
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-lg font-black text-white transition-transform group-hover:rotate-3">
            B.
          </div>

          <div>
            <span className="block text-base font-bold tracking-tight text-neutral-950">
              Bikram<span className="text-blue-600">.</span>
            </span>

            <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Ideas & Insights
            </span>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm font-medium text-neutral-500 md:flex"
        >
          <Link href="/" className="text-neutral-950">
            Home
          </Link>

          <Link href="/#featured" className="transition hover:text-blue-600">
            Featured
          </Link>

          <Link href="/#articles" className="transition hover:text-blue-600">
            Articles
          </Link>

          <Link href="/#topics" className="transition hover:text-blue-600">
            Topics
          </Link>
        </nav>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
        >
          Write an article
          <span aria-hidden="true">↗</span>
        </Link>

      </div>
    </header>
  );
}