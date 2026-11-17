import { getAllContacts, getPendingCount, toggleContactConfirm, deleteContact } from '@/app/actions/contactAdminAction';
import Link from 'next/link';
import { Suspense } from 'react';

// 1. Separate async component that fetches data
async function ContactsTable() {
  const contacts = await getAllContacts();

  return (
    <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-xl">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
          <tr>
            <th className="py-3.5 px-6 font-semibold">Name</th>
            <th className="py-3.5 px-4 font-semibold">Email</th>
            <th className="py-3.5 px-4 font-semibold">Message</th>
            <th className="py-3.5 px-4 font-semibold">Status</th>
            <th className="py-3.5 px-4 font-semibold">Date</th>
            <th className="py-3.5 px-6 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 text-zinc-300">
          {contacts.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-zinc-500">
                No contact submissions found.
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-zinc-900/40 transition">
                <td className="py-4 px-6 font-medium text-white">{contact.name}</td>
                <td className="py-4 px-4 text-zinc-400">{contact.email}</td>
                <td className="py-4 px-4 max-w-xs truncate text-zinc-300">{contact.message}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    contact.confirm === 1 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {contact.confirm === 1 ? '● Confirmed' : '○ Pending'}
                  </span>
                </td>
                <td className="py-4 px-4 text-zinc-500 text-xs">
                  {new Date(contact.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <form action={async () => {
                    'use server';
                    await toggleContactConfirm(contact.id, contact.confirm);
                  }} className="inline">
                    <button
                      type="submit"
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border border-zinc-700"
                    >
                      {contact.confirm === 1 ? 'Mark Unconfirmed' : 'Confirm'}
                    </button>
                  </form>

                  <form action={async () => {
                    'use server';
                    await deleteContact(contact.id);
                  }} className="inline">
                    <button
                      type="submit"
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border border-red-500/20"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Separate component for pending count badge
async function PendingBadge() {
  const count = await getPendingCount();
  return (
    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-semibold">
      Pending: {count}
    </span>
  );
}

// 2. Main Page Component containing Suspense boundaries
export default function AdminContactsPage() {
  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Contact Submissions</h1>
          <p className="text-sm text-zinc-400 mt-1">Review and manage inquiries from your portfolio contact form.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="border border-zinc-700 bg-zinc-900 text-zinc-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition shadow-xs"
          >
            ← Back to Dashboard
          </Link>
          
          <Suspense fallback={<span className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-sm">Loading...</span>}>
            <PendingBadge />
          </Suspense>
        </div>
      </div>

      {/* Table wrapped in Suspense to satisfy cacheComponents & prerendering */}
      <Suspense fallback={
        <div className="border border-zinc-800 rounded-2xl bg-zinc-900/50 p-12 text-center text-zinc-500 animate-pulse">
          Loading contact submissions from Turso...
        </div>
      }>
        <ContactsTable />
      </Suspense>
    </main>
  );
}