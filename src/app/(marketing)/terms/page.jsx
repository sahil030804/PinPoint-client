'use client';

import { PublicNavbar } from '@/components/common/PublicNavbar';
import { PublicFooter } from '@/components/common/PublicFooter';

const SECTIONS = [
  {
    title: 'The service',
    body: 'PinPoint provides visual website feedback tooling: an embeddable widget, screenshot review, annotations, and team collaboration. Free workspaces are subject to the usage limits shown on the pricing page.',
  },
  {
    title: 'Your content',
    body: 'You keep full ownership of everything you submit — screenshots, feedback, and comments. You grant us a license to host and display that content back to your workspace members as part of the service.',
  },
  {
    title: 'Acceptable use',
    body: 'Don\u2019t use PinPoint to collect data you have no right to collect, to harass others, or to probe, attack, or overload the service. We may suspend workspaces that abuse the platform.',
  },
  {
    title: 'Availability',
    body: 'We aim for high availability but the service is provided \u201cas is\u201d without warranties. We may update, limit, or discontinue features with reasonable notice.',
  },
  {
    title: 'Accounts and billing',
    body: 'You are responsible for activity under your account. Paid plans, where offered, are billed per the terms presented at checkout; contact us for invoices, cancellations, and refunds.',
  },
  {
    title: 'Termination',
    body: 'You can stop using PinPoint at any time. We may suspend accounts that breach these terms. On termination we delete or anonymize workspace data within a reasonable period.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNavbar active="" />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Last updated October 2026. Short version: use PinPoint fairly, your content stays yours.
        </p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
