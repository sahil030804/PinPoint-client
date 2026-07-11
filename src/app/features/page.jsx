'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Camera, Code, MessageCircle, RefreshCw,
  ArrowRight, Twitter, Linkedin,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Visual Pin Feedback',
    icon: MapPin,
    description:
      'Drop pins precisely where you need changes. No more vague descriptions like \'make the logo bigger in the top right\'. Your feedback is anchored to the exact coordinate on the screen.',
    visual: (
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
        <div className="aspect-[4/3] rounded-xl bg-white dark:bg-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 p-4">
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
            <div className="flex gap-3 mb-4">
              <div className="h-16 w-20 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
          <div className="absolute top-8 left-16 z-10">
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-lg">1</div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-xl">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">John Doe</p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Update the padding on this card component.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Auto Screenshots',
    icon: Camera,
    description:
      'Every pin automatically captures a pixel-perfect snapshot of the viewport at that exact moment. Context is never lost.',
    visual: (
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Camera size={56} className="text-white/90" />
        </div>
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">Viewport captured at 1440x900</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Rich Metadata',
    icon: Code,
    description:
      'We invisibly collect OS, browser version, screen resolution, and console logs with every feedback submission.',
    visual: (
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
        <div className="overflow-hidden rounded-xl bg-gray-900 dark:bg-gray-950 shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-700/50 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-400">metadata.json</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            <div className="text-purple-400">{'{'}</div>
            <div className="ml-3">
              <span className="text-blue-300">&quot;browser&quot;</span>
              <span className="text-gray-400">: </span>
              <span className="text-green-300">&quot;Chrome 120&quot;</span>
              <span className="text-gray-400">,</span>
            </div>
            <div className="ml-3">
              <span className="text-blue-300">&quot;os&quot;</span>
              <span className="text-gray-400">: </span>
              <span className="text-green-300">&quot;macOS Sonoma&quot;</span>
              <span className="text-gray-400">,</span>
            </div>
            <div className="ml-3">
              <span className="text-blue-300">&quot;viewport&quot;</span>
              <span className="text-gray-400">: </span>
              <span className="text-green-300">&quot;1440x900&quot;</span>
            </div>
            <div className="text-purple-400">{'}'}</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Collaboration',
    icon: MessageCircle,
    description:
      'Turn feedback into conversations. Mention teammates, resolve issues, and track progress all in one unified thread.',
    visual: (
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-xs font-bold text-purple-600 dark:text-purple-400">
              A
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Anna</p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">Fixed in latest PR. Can you review?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="rounded-2xl rounded-tr-sm bg-blue-50 dark:bg-blue-950/50 px-4 py-2.5 shadow-sm border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Sam</p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">Looks great, resolving.</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-bold text-blue-600 dark:text-blue-400">
              S
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Syncs with your Stack',
    icon: RefreshCw,
    description:
      'Push visual feedback directly to Jira, Linear, Slack, or GitHub. Create actionable tickets without leaving the context of your design.',
    visual: (
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex items-center justify-center gap-5">
          {[
            { label: 'Jira', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
            { label: 'Linear', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
            { label: 'Slack', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
            { label: 'GitHub', color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
          ].map(({ label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${color} shadow-sm text-xs font-bold`}>
                {label === 'GitHub' ? 'GH' : label.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            <ArrowRight size={12} />
            Create ticket from feedback
          </span>
        </div>
      </div>
    ),
  },
];

function FeatureSection({ feature, index }) {
  const isReversed = index % 2 === 1;
  const Icon = feature.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-20 sm:py-28"
    >
      <div className={`mx-auto max-w-7xl px-6 grid items-center gap-12 lg:gap-20 ${isReversed ? 'lg:grid-flow-dense lg:grid-cols-2' : 'lg:grid-cols-2'}`}>
        <div className={isReversed ? 'lg:col-start-2' : ''}>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-6">
            <Icon size={24} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {feature.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
            {feature.description}
          </p>
        </div>
        <div className={isReversed ? 'lg:col-start-1' : ''}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {feature.visual}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            PinPoint
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-blue-600 dark:text-blue-400">Features</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-24 pb-8 sm:pt-32 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
            Feedback that speaks volumes,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              without writing a word.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            PinPoint transforms the way teams review digital products. Simply point, click,
            and leave feedback directly on your UI. We capture the rest.
          </p>
        </motion.div>
      </section>

      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
        {FEATURES.map((feature, i) => (
          <FeatureSection key={feature.title} feature={feature} index={i} />
        ))}
      </div>

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

      <footer className="border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PinPoint. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Product</Link>
              <Link href="/features" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Features</Link>
              <Link href="/pricing" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
