'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        toastError(res.error?.message || 'Login failed');
      }
    } catch (err) {
      toastError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 items-center justify-center">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjYgMCAzLTEuMzQgMy0zcy0xLjM0LTMtMy0zLTMgMS4zNC0zIDMgMS4zNCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8 auth-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-white/90">Trusted by 500+ teams</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight auth-slide-up">
            Ship better websites,<br />faster.
          </h2>
          <p className="mt-4 text-lg text-blue-100/80 leading-relaxed auth-slide-up-delay">
            Visual feedback that gives your team everything they need to fix issues instantly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-blue-100/60 auth-slide-up-delay-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Free forever tier
            </span>
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 block auth-fade-in">
            <span className="text-2xl font-bold text-foreground tracking-tight">PinPoint</span>
          </Link>
          <div className="auth-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="auth-slide-up-delay">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saaS-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-slide-up-delay">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="saaS-input"
                placeholder="Enter your password"
              />
              <Link
                href="/auth/forgot-password"
                className="mt-2 block text-right text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="auth-slide-up-delay-2">
              <button
                type="submit"
                disabled={loading}
                className="saaS-btn-primary w-full h-11 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground auth-slide-up-delay-3">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
