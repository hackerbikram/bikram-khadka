import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, initDb, type Post } from '@/app/lib/db';
import DeleteButton from './DeleteButton';

export const instant = false;

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('blog_admin_token');
  if (!token || token.value !== 'authenticated_session') {
    redirect('/admin/login');
  }

  await initDb();
  const result = await db.execute('SELECT * FROM posts ORDER BY createdAt DESC');
  const posts = result.rows as unknown as Post[];

  async function deletePost(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [id],
    });
    redirect('/admin');
  }

  async function togglePublish(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentStatus = formData.get('status') as string;
    const newStatus = currentStatus === '1' ? 0 : 1;

    await db.execute({
      sql: 'UPDATE posts SET published = ? WHERE id = ?',
      args: [newStatus, id],
    });
    redirect('/admin');
  }

  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('blog_admin_token');
    redirect('/admin/login');
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-950">Blog Administration</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage, edit, publish, and track views across your articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="bg-neutral-950 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition shadow-xs"
          >
            + New Post
          </Link>
          <form action={handleLogout}>
            <button
              type="submit"
              className="border border-neutral-300 text-neutral-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Analytics / Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-neutral-900">{posts.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Published Posts</p>
          <p className="text-2xl font-bold text-emerald-600">
            {posts.filter(p => p.published === 1).length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Total Views Tracked</p>
          <p className="text-2xl font-bold text-blue-600">
            {posts.reduce((acc, p: any) => acc + (p.views || 0), 0)}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No articles found in database.
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 px-6 font-medium text-neutral-900 max-w-xs truncate">
                      <Link href={`/posts/${post.slug}`} target="_blank" className="hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <span className="bg-neutral-100 px-2 py-1 rounded text-xs font-medium">
                        {post.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value={post.published} />
                        <button
                          type="submit"
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            post.published === 1
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {post.published === 1 ? '● Published' : '○ Draft'}
                        </button>
                      </form>
                    </td>
                    <td className="py-4 px-4 text-neutral-600 font-mono text-xs">
                      👁️ {post.views || 0}
                    </td>
                    <td className="py-4 px-4 text-neutral-500 text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deletePost} className="inline">
                        <input type="hidden" name="id" value={post.id} />
                        <DeleteButton />
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}