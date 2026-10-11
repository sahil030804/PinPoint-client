'use client';

import { PublicNavbar } from '@/components/common/PublicNavbar';
import { PublicFooter } from '@/components/common/PublicFooter';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'Account details you provide (name, email), workspace content you create (projects, websites, feedback, screenshots, comments), and technical context attached to feedback (browser, OS, viewport, page URL). We do not sell your personal data.',
  },
  {
    title: 'How we use it',
    body: 'To operate PinPoint: authenticating you, storing and displaying your team\u2019s feedback, sending transactional emails (invitations, notifications you opt into), and keeping the service secure and reliable.',
  },
  {
    title: 'Screenshots and feedback content',
    body: 'Screenshots you capture through the widget are stored so your team can review them. Only members of your workspace can access them. Deleting feedback permanently removes its screenshot.',
  },
  {
    title: 'Data retention',
    body: 'We keep workspace data while your account is active and for a reasonable period afterwards. Free workspaces are subject to the history limits shown on the pricing page. Contact us to request export or deletion of your data.',
  },
  {
    title: 'Security',
    body: 'Traffic is encrypted in transit (TLS), passwords are hashed, and API access is scoped to your workspace membership. No system is perfectly secure, so avoid submitting passwords or secrets in feedback.',
  },
  {
    title: 'Contact',
    body: 'Questions about this policy? Reach us through the contact link on the pricing page and we\u2019ll respond promptly.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNavbar active="" />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Last updated October 2026. Short version: your data is yours — we store it to run PinPoint and never sell it.
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
