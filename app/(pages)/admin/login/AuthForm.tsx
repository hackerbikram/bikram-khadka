'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

export type AuthState = {
  error?: string;
} | null;

interface AuthFormProps {
  loginAction: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  registerAction: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  allowRegistration: boolean;
}

export default function AuthForm({
  loginAction,
  registerAction,
  allowRegistration,
}: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, null);
  const [registerState, registerDispatch, isRegisterPending] = useActionState(registerAction, null);

  const isPending = mode === 'login' ? isLoginPending : isRegisterPending;
  const currentError = mode === 'login' ? loginState?.error : registerState?.error;

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setShowPassword(false);
  };

  return (
    <div className="relative w-full max-w-[440px]">
      {/* Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back to Journal
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Admin Access
        </span>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-[28px] border border-neutral-200/90 bg-white p-7 shadow-xl shadow-neutral-950/[0.03] sm:p-9">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            {mode === 'login' ? 'Welcome back.' : 'Create admin account.'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {mode === 'login'
              ? 'Sign in with your credentials to manage articles, drafts, and analytics.'
              : 'Set up your encrypted credentials in the database to unlock the studio.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Shown if registration is enabled) */}
        {allowRegistration && (
          <div className="mb-7 grid grid-cols-2 rounded-2xl bg-neutral-100/90 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Banner */}
        {currentError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-medium text-red-700"
          >
            <span className="mt-0.5 text-sm leading-none">⚠️</span>
            <span>{currentError}</span>
          </div>
        )}

        {/* Form */}
        <form
          action={mode === 'login' ? loginDispatch : registerDispatch}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@bikram.dev"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3.5 text-sm text-neutral-950 placeholder:text-neutral-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500"
              >
                Password
              </label>
              {mode === 'register' && (
                <span className="text-[11px] font-medium text-neutral-400">
                  Min. 8 characters
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : 1}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 py-3.5 pl-4 pr-16 text-sm text-neutral-950 placeholder:text-neutral-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-200/60 hover:text-neutral-900 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3.5 text-sm text-neutral-950 placeholder:text-neutral-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Studio' : 'Create Account & Enter'}</span>
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security Footer */}
      <p className="mt-6 text-center text-xs text-neutral-400">
        Protected with bcrypt hashing &amp; encrypted HTTP-only cookies.
      </p>
    </div>
  );
}