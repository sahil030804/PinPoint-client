'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for individuals starting out.',
    features: [
      'Up to 3 projects',
      'Basic visual feedback',
      '7-day history',
      'No integrations',
    ],
    cta: 'Get Started',
    href: '/auth/register',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: { monthly: 19, annual: 190 },
    description: 'For growing teams requiring robust tools.',
    features: [
      'Unlimited projects',
      'Advanced visual feedback',
      'Unlimited history',
      'Slack & GitHub integrations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/auth/register?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Business',
    price: { monthly: 49, annual: 490 },
    description: 'Advanced security and administrative controls.',
    features: [
      'Everything in Pro',
      'Custom domain',
      'SSO/SAML',
      'Dedicated Account Manager',
    ],
    cta: 'Get Started',
    href: '/auth/register?plan=business',
    highlighted: false,
    badge: null,
  },
];

function PricingCard({ plan, isAnnual, index }) {
  const price = isAnnual ? plan.price.annual : plan.price.monthly;
  const period = isAnnual ? '/year' : '/month';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={plan.highlighted ? { y: -6 } : { y: -3 }}
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
        plan.highlighted
          ? 'border-blue-500 bg-white dark:bg-gray-900 shadow-xl shadow-blue-500/10 scale-105 z-10'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
            <Star size={12} />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          {price === 0 ? '$0' : `$${price}`}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{period}</span>
      </div>

      {plan.name === 'Free' && (
        <p className="mt-1 text-xs text-gray-400">Forever free</p>
      )}

      <ul className="mt-8 space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8"
      >
        <Link
          href={plan.href}
          className={`flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
            plan.highlighted
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
              : 'border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {plan.cta}
          {plan.highlighted && <ArrowRight size={16} />}
        </Link>
      </motion.div>

      {plan.name === 'Business' && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Or <Link href="/auth/register" className="text-blue-600 hover:underline">start free</Link> and upgrade later
        </p>
      )}
    </motion.div>
  );
}

function CompareTable() {
  const features = [
    { name: 'Projects', free: '3', pro: 'Unlimited', biz: 'Unlimited' },
    { name: 'Feedback Pins', free: '100/project', pro: 'Unlimited', biz: 'Unlimited' },
    { name: 'Data Retention', free: '7 Days', pro: 'Unlimited', biz: 'Unlimited' },
    { name: 'Integrations', free: '\u2716', pro: '\u2714', biz: '\u2714' },
    { name: 'SSO', free: '\u2716', pro: '\u2716', biz: '\u2714' },
  ];

  const checkClass = 'text-green-600 dark:text-green-400';
  const xClass = 'text-gray-400 dark:text-gray-500';

  return (
    <div className="mt-24">
      <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Compare Features
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full max-w-3xl mx-auto text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="py-3 pr-8 text-left text-gray-500 dark:text-gray-400 font-medium">Features</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">Free</th>
              <th className="py-3 px-4 text-center font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-t-lg">Pro</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">Business</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="py-3 pr-8 text-gray-700 dark:text-gray-300">{f.name}</td>
                <td className={`py-3 px-4 text-center ${f.free === '\u2714' ? checkClass : xClass}`}>{f.free}</td>
                <td className={`py-3 px-4 text-center bg-blue-50 dark:bg-blue-950/30 ${f.pro === '\u2714' ? checkClass : xClass}`}>{f.pro}</td>
                <td className={`py-3 px-4 text-center ${f.biz === '\u2714' ? checkClass : xClass}`}>{f.biz}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            PinPoint
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-sm"
            >
              Get Started Free
              <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Designed for high-performance teams. Choose the plan that fits your visual feedback needs.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative h-7 w-12 rounded-full transition-colors ${isAnnual ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                isAnnual ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Annual
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} index={i} />
          ))}
        </div>

        <CompareTable />

        {/* Need something more custom? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Need something more custom?
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            We offer custom plans for enterprise organizations requiring specific security compliance, volume discounts, and tailored onboarding.
          </p>
          <Link
            href="mailto:sahil030804@gmail.com?subject=PinPoint%20Enterprise%20Inquiry"
            className="inline-flex items-center gap-2 mt-6 rounded-xl border-2 border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Contact Sales
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                PinPoint
              </Link>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Visual feedback for high-performance teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Careers
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Help Center
                  </span>
                </li>
                <li>
                  <a
                    href="mailto:sahil030804@gmail.com"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} PinPoint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
