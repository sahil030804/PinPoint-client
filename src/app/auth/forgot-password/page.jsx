'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error?.message || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="mb-8 block text-center text-2xl font-bold text-gray-900 dark:text-white">
            PinPoint
          </Link>
          <div className="rounded-lg bg-emerald-50 p-6 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Check your email for a password reset link.
            </p>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-2xl font-bold text-gray-900 dark:text-white">
          PinPoint
        </Link>
        <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
