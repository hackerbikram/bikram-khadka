'use client';

import { useEffect } from 'react';

export default function RecentTracker({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    if (!slug) return;

    try {
      // Read existing recent posts from cookie or localStorage
      const cookieName = 'bikram_recent_posts';
      const existingCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${cookieName}=`));

      let recent: { slug: string; title: string }[] = [];
      if (existingCookie) {
        recent = JSON.parse(decodeURIComponent(existingCookie.split('=')[1]));
      }

      // Remove if already exists, then add to front
      recent = recent.filter((p) => p.slug !== slug);
      recent.unshift({ slug, title });

      // Keep only the last 5 viewed articles
      recent = recent.slice(0, 5);

      // Save cookie for 30 days
      const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
      document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(recent))}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (e) {
      console.error('Failed to save recent view', e);
    }
  }, [slug, title]);

  return null;
}