'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function PublicNavbar({ active = '', variant = 'sticky' }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== 'hero') return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const showBg = variant === 'hero' ? scrolled : true;

  const linkClass = (href) => {
    const base = 'text-sm transition-colors';
    if (active === href) {
      return `${base} font-medium text-blue-600 dark:text-blue-400`;
    }
    return `${base} text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white`;
  };

  const mobileLinkClass = (href) => {
    const base = 'block text-sm';
    if (active === href) {
      return `${base} font-medium text-blue-600 dark:text-blue-400`;
    }
    return `${base} text-gray-600 dark:text-gray-400`;
  };

  return (
    <header
      className={`${
        variant === 'hero'
          ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              showBg
                ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50'
                : 'bg-transparent'
            }`
          : 'border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          <MapPin size={22} className="text-blue-600" />
          PinPoint
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className={linkClass('')}>Login</Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 text-gray-600 dark:text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4 space-y-3"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={mobileLinkClass(href)}>
                {label}
              </Link>
            ))}
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                <LayoutDashboard size={16} className="inline mr-1.5 -mt-0.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={mobileLinkClass('')}>Login</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block text-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Get Started Free</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
