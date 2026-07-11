'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Target, Shield, Zap, Users, Quote,
} from 'lucide-react';
import { PublicNavbar } from '@/components/common/PublicNavbar';
import { PublicFooter } from '@/components/common/PublicFooter';

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const VALUES = [
  {
    icon: Target,
    title: 'Precision',
    desc: 'Feedback anchored to exact coordinates means no more "fix the thing near the thing." Every pin tells your team exactly where to look.',
  },
  {
    icon: Zap,
    title: 'Speed',
    desc: 'From pin to fix in record time. Automatic screenshots and metadata eliminate back-and-forth questions.',
  },
  {
    icon: Shield,
    title: 'Context',
    desc: 'Browser, OS, viewport, and console state captured automatically. Your team gets the full picture without asking.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    desc: 'Turn feedback into action. Threaded comments, assignees, and integrations keep everyone aligned.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNavbar active="/about" />

      <section className="mx-auto max-w-7xl px-6 pt-24 pb-8 sm:pt-32 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
            Built to make feedback{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              finally make sense.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            PinPoint was created because sharing visual feedback shouldn&apos;t require a spreadsheet, three screenshots, and a prayer. We believe the best feedback is the kind that shows exactly what needs to change.
          </p>
        </motion.div>
      </section>

      <section className="py-24 border-t border-gray-100 dark:border-gray-800/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  The story behind PinPoint
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every developer has been there: a vague bug report, a blurry screenshot, a
                  five-email chain just to figure out what &ldquo;make it look better&rdquo; means.
                </p>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  PinPoint fixes that. Click anywhere on a live page, drop a pin, and your
                  feedback carries the exact coordinates, a screenshot, browser metadata, and
                  console state — everything a developer needs to understand and fix the issue.
                </p>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  We&apos;re on a mission to eliminate feedback friction so teams can ship
                  quality product faster.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 p-8 shadow-sm">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="relative">
                  <Quote size={24} className="text-blue-600/15 dark:text-blue-400/15 absolute -top-1 -left-1" />
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 pl-6">
                    As a developer, I built PinPoint because I was tired of chasing context.
                    Now every pin carries the exact screenshot, coordinates, and browser
                    metadata a developer needs — no more back-and-forth.
                  </p>
                </blockquote>
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                    SR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Sahil Ranpariya</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Founder &amp; Developer, PinPoint</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white tracking-tight">
              What we believe in
            </h2>
            <p className="mt-3 text-center text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              These principles guide every feature we build and every decision we make.
            </p>
          </FadeIn>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <FadeIn key={value.title} delay={0.1 * i}>
                  <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-5">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  A note from the founder
                </h3>
                <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p>
                    I built PinPoint because I was tired of the friction. As a developer, I
                    spent more time deciphering feedback than fixing bugs. As a product person,
                    I watched good ideas get lost in translation.
                  </p>
                  <p>
                    There had to be a better way — one click, one pin, everything captured.
                    That&apos;s PinPoint.
                  </p>
                  <p>
                    We&apos;re just getting started. If you have feedback about PinPoint itself
                    (the irony is not lost on us), I&apos;d love to hear it.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    SK
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Sahil</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Founder, PinPoint</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Let&apos;s build something better together
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Whether you&apos;re a solo developer, a growing startup, or a large team —
                  PinPoint is designed to fit your workflow, not the other way around.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Start Free Trial
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="mailto:sahil030804@gmail.com"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Contact Me
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to clear up the confusion?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Start capturing visual feedback in seconds. No credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-all shadow-xl active:scale-[0.97]"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
