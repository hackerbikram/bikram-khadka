'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  hash?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Featured', href: '/#featured', hash: '#featured' },
  { label: 'Articles', href: '/#articles', hash: '#articles' },
  { label: 'Topics', href: '/#topics', hash: '#topics' },
  {label: 'About',href: '/about'},
];

export default function NavBar() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync URL hash & scroll elevation
  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    const handleScroll = () => setScrolled(window.scrollY > 12);

    updateHash();
    handleScroll();

    window.addEventListener('hashchange', updateHash);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', updateHash);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAdminRoute = pathname.startsWith('/admin');
  const isCreateRoute = pathname === '/create';

  const isItemActive = (item: NavItem) => {
    if (item.hash) {
      return pathname === '/' && activeHash === item.hash;
    }
    if (item.href === '/') {
      return pathname === '/' && !activeHash;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-neutral-200/80 bg-white/95 shadow-xs backdrop-blur-xl'
          : 'border-b border-neutral-200/60 bg-white/85 backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand Logo: Bikram Article */}
        <Link
          href="/"
          onClick={() => setActiveHash('')}
          aria-label="Bikram Article home"
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-lg font-black text-white shadow-xs transition-all duration-300 group-hover:rotate-3 group-hover:bg-blue-600">
            B<span className="text-blue-400 group-hover:text-white">.</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-neutral-950">
              Bikram <span className="font-semibold text-blue-600">Article</span>
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Ideas &amp; Insights
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1.5 rounded-full border border-neutral-200/70 bg-neutral-50/80 p-1.5 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveHash(item.hash || '')}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                {item.label}
                {active && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 align-middle" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className={`hidden rounded-full px-3.5 py-2 text-xs font-semibold transition sm:inline-flex ${
              isAdminRoute
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
            }`}
          >
            Studio
          </Link>

          <Link
            href="/create"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] ${
              isCreateRoute
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-neutral-950 text-white hover:bg-blue-600'
            }`}
          >
            <span>Write an article</span>
            <span aria-hidden="true" className="text-[11px]">
              ↗
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 md:hidden cursor-pointer"
          >
            <div className="flex w-4 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full rounded-full bg-neutral-900 transition-transform duration-200 ${
                  mobileOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-neutral-900 transition-opacity duration-200 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-neutral-900 transition-transform duration-200 ${
                  mobileOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="border-t border-neutral-200/80 bg-white px-5 py-5 shadow-lg md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActiveHash(item.hash || '');
                    setMobileOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </Link>
              );
            })}

            <div className="my-2 border-t border-neutral-100 pt-2">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isAdminRoute
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
              >
                <span>Admin Studio</span>
                <span className="text-xs text-neutral-400">→</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}