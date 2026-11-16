import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, createUserTable } from '@/app/lib/db';
import { registerUser, authenticateUser } from '@/app/lib/auth';
import AuthForm, { type AuthState } from './AuthForm';

export const instant = false;

async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('blog_admin_token', 'authenticated_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

async function canRegisterAdmin(): Promise<boolean> {
  if (process.env.ALLOW_ADMIN_REGISTER === 'true') return true;

  await createUserTable();
  const result = await db.execute('SELECT COUNT(*) as count FROM users');
  const count = Number(result.rows[0]?.count || 0);

  // Automatically allow registration if no admin exists yet
  return count === 0;
}

export default async function AdminLoginPage() {
  // 1. If already authenticated, go straight to dashboard
  const cookieStore = await cookies();
  const existingToken = cookieStore.get('blog_admin_token');
  if (existingToken?.value === 'authenticated_session') {
    redirect('/admin');
  }

  const allowRegistration = await canRegisterAdmin();

  // 2. Server Action: Login
  async function handleLogin(_prevState: AuthState, formData: FormData): Promise<AuthState> {
    'use server';

    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Please enter both your email and password.' };
    }

    const res = await authenticateUser(email, password);

    if (!res.success) {
      return { error: res.error || 'Invalid email or password.' };
    }

    await setAdminSessionCookie();
    redirect('/admin');
  }

  // 3. Server Action: Register
  async function handleRegister(_prevState: AuthState, formData: FormData): Promise<AuthState> {
    'use server';

    const allowed = await canRegisterAdmin();
    if (!allowed) {
      return { error: 'Registration is locked. Set ALLOW_ADMIN_REGISTER=true in .env.local to add users.' };
    }

    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email || !password) {
      return { error: 'All fields are required.' };
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' };
    }

    const res = await registerUser(email, password);

    if (!res.success) {
      return { error: res.error || 'Unable to create account.' };
    }

    await setAdminSessionCookie();
    redirect('/admin');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-4 py-16 text-neutral-900">
      {/* Ambient Background Glows matching Homepage */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-indigo-100/50 blur-3xl" />

      <AuthForm
        loginAction={handleLogin}
        registerAction={handleRegister}
        allowRegistration={allowRegistration}
      />
    </main>
  );
}