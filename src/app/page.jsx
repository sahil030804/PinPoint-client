'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Zap, MousePointerClick,
  Camera, Code, MessageSquare, Users, MapPin, Play,
  BarChart3, ExternalLink
} from 'lucide-react';

function FadeIn({ children, delay = 0, direction = 'up' }) {
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 24 : -24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={variants}>
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          <MapPin size={22} className="text-blue-600" />
          PinPoint
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">About</Link>
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Login</Link>
          <Link
            href="/auth/register"
            className="saaS-btn-primary rounded-lg px-5 py-2.5 text-sm"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden p-2 text-gray-600 dark:text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4 space-y-3">
            <Link href="/features" className="block text-sm text-gray-600 dark:text-gray-400">Features</Link>
            <Link href="/pricing" className="block text-sm text-gray-600 dark:text-gray-400">Pricing</Link>
            <Link href="/about" className="block text-sm text-gray-600 dark:text-gray-400">About</Link>
            <Link href="/auth/login" className="block text-sm text-gray-600 dark:text-gray-400">Login</Link>
            <Link href="/auth/register" className="block text-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Get Started Free</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-5 py-1.5 mb-8">
            <span className="text-sm">🎉</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Introducing PinPoint 2.0</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Click anywhere.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Leave feedback. Ship faster.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Capture visual feedback directly on your live website. PinPoint automatically gathers screenshots, browser details, and technical context so your team can focus on fixing, not finding.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.97]"
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all active:scale-[0.97]"
            >
              <Play size={18} />
              Watch Demo
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-10 relative mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-gray-900/10 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-3 flex-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono text-left">
                  https://your-awesome-site.com
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 relative overflow-hidden">
                <div className="absolute inset-0 p-6">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-lg bg-white/70 dark:bg-gray-800/70 p-4 shadow-sm border border-gray-200/70 dark:border-gray-700/50">
                        <div className="h-3 w-20 bg-blue-100 dark:bg-blue-900/30 rounded mb-3" />
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700/50 rounded mb-2" />
                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700/50 rounded mb-2" />
                        <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700/50 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Feedback pin card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-1/3 right-8 max-w-xs w-full"
                  >
                    <div className="relative rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 p-4 shadow-lg shadow-blue-500/10">
                      <div className="absolute -left-2 top-6 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-blue-200 dark:border-blue-700 rotate-[-45deg]" />
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                            &ldquo;The padding here looks inconsistent on mobile viewports.&rdquo;
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[11px] font-medium">Chrome 114</span>
                            <span className="inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[11px] font-medium">Mac OS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating widget button */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-6 right-6"
                >
                  <div className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer hover:bg-blue-500 transition-colors">
                    <MessageSquare size={16} />
                    Leave Feedback
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Install Widget',
      desc: 'Drop a single line of JavaScript into your site. No complex setup required.',
      icon: Zap,
    },
    {
      num: '02',
      title: 'Point & Comment',
      desc: 'Visitors click anywhere on the UI to leave a precise, localized comment.',
      icon: MousePointerClick,
    },
    {
      num: '03',
      title: 'Team Resolves',
      desc: 'Devs get the exact screenshot, browser specs, and DOM element to fix it fast.',
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white tracking-tight">
            How PinPoint Works
          </h2>
          <p className="mt-3 text-center text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Three simple steps to streamline your visual review process.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeIn key={i} delay={0.2 * i}>
                <div className="relative text-center">
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Icon size={32} className="text-blue-600 dark:text-blue-400" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">{step.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Camera,
      title: 'Auto Screenshots',
      desc: 'PinPoint captures exactly what the user sees — no more guessing.',
      color: 'blue',
      details: null,
    },
    {
      icon: Code,
      title: 'Rich Metadata',
      desc: 'OS, browser, screen size, and console logs attached automatically.',
      color: 'indigo',
      details: (
        <div className="mt-3 rounded-lg bg-gray-900 dark:bg-gray-950 p-3 font-mono text-[11px] leading-relaxed text-green-400 overflow-x-auto">
          {`{`}
          <br />
          &nbsp;&nbsp;&ldquo;os&rdquo;: &ldquo;macOS 14.5&rdquo;,<br />
          &nbsp;&nbsp;&ldquo;browser&rdquo;: &ldquo;Chrome 114&rdquo;,<br />
          &nbsp;&nbsp;&ldquo;viewport&rdquo;: &ldquo;1440x900&rdquo;,<br />
          &nbsp;&nbsp;&ldquo;resolution&rdquo;: &ldquo;2560x1600&rdquo;
          <br />
          {`}`}
        </div>
      ),
    },
    {
      icon: MessageSquare,
      title: 'Visual Pin Feedback',
      desc: 'Leave threaded comments directly attached to specific DOM elements.',
      color: 'purple',
      details: null,
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Syncs seamlessly with Jira, Linear, and Slack. Keep your existing workflow while upgrading your feedback loops.',
      color: 'orange',
      details: null,
    },
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-600 dark:text-blue-400', border: 'hover:border-blue-200 dark:hover:border-blue-800' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: 'text-indigo-600 dark:text-indigo-400', border: 'hover:border-indigo-200 dark:hover:border-indigo-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-600 dark:text-purple-400', border: 'hover:border-purple-200 dark:hover:border-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600 dark:text-orange-400', border: 'hover:border-orange-200 dark:hover:border-orange-800' },
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white tracking-tight">
            Everything you need to ship quality.
          </h2>
          <p className="mt-3 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built for modern web teams who value context and clarity.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => {
            const colors = colorClasses[feature.color];
            const Icon = feature.icon;
            return (
              <FadeIn key={i} delay={0.1 * i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`group rounded-xl border border-gray-200 dark:border-gray-800 ${colors.border} p-8 transition-all duration-300 cursor-default ${colors.bg}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.icon}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                  {feature.details}
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white tracking-tight">
            Start for free. Scale when you need to.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 mx-auto max-w-lg">
            <motion.div
              whileHover={{ y: -4 }}
              className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-lg shadow-gray-900/5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                  $0<span className="text-lg font-medium text-gray-500 dark:text-gray-400">/mo</span>
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Up to 3 projects and 100 feedback pins.
                </p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited seats',
                  'Slack Integration',
                  '30-day data retention',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className="saaS-btn-primary w-full justify-center px-6 py-3 text-base"
                >
                  Start Free Trial
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to ship faster?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
            Join thousands of modern teams fixing bugs visually.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-all active:scale-[0.97] shadow-xl"
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              <MapPin size={20} className="text-blue-600" />
              PinPoint
            </Link>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
              Visual website feedback for modern teams. Click anywhere. Leave feedback. Ship faster.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <div className="space-y-3">
              <Link href="/features" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
            <div className="space-y-3">
              <Link href="/about" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">About</Link>
              <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Connect</h4>
            <div className="space-y-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Twitter
                <ExternalLink size={12} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                LinkedIn
                <ExternalLink size={12} />
              </a>
              <Link href="/support" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} PinPoint Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
