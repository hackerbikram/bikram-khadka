import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  async function handleLogin(formData: FormData) {
    'use server';

    const password = formData.get('password') as string;
    const adminSecret = process.env.ADMIN_PASSWORD || 'secret123'; // Change in .env.local

    if (password === adminSecret) {
      const cookieStore = await cookies();
      cookieStore.set('blog_admin_token', 'authenticated_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      redirect('/admin');
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs">
        <Link href="/" className="text-xs text-neutral-500 hover:text-black mb-6 inline-block">
          ← Back to Site
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Admin Portal</h1>
        <p className="text-sm text-neutral-500 mb-6">Enter your master password to manage articles.</p>

        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-950 text-white py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}