'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { ArrowRight } from 'lucide-react';

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [invitationId, setInvitationId] = useState(null);
  const { register } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inv = searchParams.get('invitation');
    if (inv) setInvitationId(inv);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await register({ ...form, invitationId });
      if (res.success) {
        router.push('/dashboard');
      } else {
        toastError(res.error?.message || 'Registration failed');
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjYgMCAzLTEuMzQgMy0zcy0xLjM0LTMtMy0zLTMgMS4zNC0zIDMgMS4zNCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8 auth-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-white/90">Join 500+ teams</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight auth-slide-up">
            Start collecting<br />visual feedback
          </h2>
          <p className="mt-4 text-lg text-blue-100/80 leading-relaxed auth-slide-up-delay">
            Set up in 5 minutes. No credit card required. Free forever tier included.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 auth-slide-up-delay-2">
            {[
              { value: '12K+', label: 'Feedback' },
              { value: '500+', label: 'Teams' },
              { value: '98%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-100/60 mt-1">{stat.label}</p>
              </div>
            ))}
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Get started with PinPoint for free</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="auth-slide-up-delay">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="saaS-input"
                placeholder="Your full name"
              />
            </div>

            <div className="auth-slide-up-delay">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="saaS-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-slide-up-delay">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="saaS-input"
                placeholder="At least 8 characters"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Must be at least 8 characters</p>
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create account
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>

              <p className="mt-4 text-xs text-center text-muted-foreground leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground auth-slide-up-delay-3">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
