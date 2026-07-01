'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

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
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="mb-8 block text-center text-2xl font-bold text-gray-900 dark:text-white">
            PinPoint
          </Link>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
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
        <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white">Set new password</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
