'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import { ArrowLeft, Lock, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const { success: toastSuccess } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${params.token}`, { password, token: params.token });
      if (res.success) {
        toastSuccess('Password reset successfully. You are now signed in.');
        setDone(true);
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(res.error?.message || 'Invalid or expired reset link');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 bg-background">
        <div className="w-full max-w-md text-center auth-scale-in">
          <Link href="/" className="mb-10 block">
            <span className="text-2xl font-bold text-foreground tracking-tight">PinPoint</span>
          </Link>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
            <Check size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Password reset successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 items-center justify-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjYgMCAzLTEuMzQgMy0zcy0xLjM0LTMtMy0zLTMgMS4zNC0zIDMgMS4zNCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8 auth-fade-in">
            <Lock size={14} className="text-white/80" />
            <span className="text-sm font-medium text-white/90">Encrypted &amp; secure</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight auth-slide-up">
            Almost there.<br />Set a new password.
          </h2>
          <p className="mt-4 text-lg text-blue-100/80 leading-relaxed auth-slide-up-delay">
            Choose a strong password to keep your account secure.
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 block auth-fade-in">
            <span className="text-2xl font-bold text-foreground tracking-tight">PinPoint</span>
          </Link>
          <div className="auth-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Set new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive auth-slide-up">
                {error}
              </div>
            )}

            <div className="auth-slide-up-delay">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="saas-input"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="auth-slide-up-delay">
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="saas-input"
                placeholder="Repeat your password"
              />
            </div>

            <div className="auth-slide-up-delay-2">
              <button
                type="submit"
                disabled={loading}
                className="saas-btn-primary w-full h-11 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset password'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center auth-slide-up-delay-3">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
