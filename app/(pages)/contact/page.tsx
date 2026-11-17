'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createContact, ActionResponse } from './createContact';

const initialState: ActionResponse = {
  success: false,
  message: '',
};

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(createContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear form inputs automatically after a successful submission
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Get in Touch</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Have a project in mind or a question? Send a message and I&apos;ll get back to you soon.
          </p>
        </div>

        {/* Status Banner */}
        {state.message && (
          <div
            role="alert"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
              state.success
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            <span className="mt-0.5 text-base leading-none">
              {state.success ? '✓' : '✕'}
            </span>
            <p>{state.message}</p>
          </div>
        )}

        {/* Contact Form */}
        <form ref={formRef} action={formAction} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              placeholder="Your name"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              disabled={isPending}
              placeholder="Tell me about your project or inquiry..."
              className="mt-1.5 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </main>
  );
}