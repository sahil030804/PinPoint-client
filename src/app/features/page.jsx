import Link from 'next/link';

const FEATURES = [
  {
    title: 'Visual Feedback',
    desc: 'Click anywhere on the page to pin feedback. No more vague descriptions — exact coordinates, every time.',
    icon: '📍',
  },
  {
    title: 'Auto Screenshots',
    desc: 'Every submission includes a full-page screenshot. Browser, OS, viewport, and URL captured automatically.',
    icon: '📸',
  },
  {
    title: 'Feedback Timeline',
    desc: 'See exactly who did what and when. Full audit trail for every ticket from creation to resolution.',
    icon: '📋',
  },
  {
    title: 'Kanban Workflow',
    desc: 'Track feedback from New → In Progress → Done. Assign team members, set priorities, add tags.',
    icon: '🔄',
  },
  {
    title: 'Team Collaboration',
    desc: 'Invite your team, assign tickets, and discuss with comments. Workspaces keep everything organized.',
    icon: '👥',
  },
  {
    title: 'Instant Setup',
    desc: 'Add one script tag to your site. Customize the widget color, position, and button text to match your brand.',
    icon: '⚡',
  },
  {
    title: 'Widget Customization',
    desc: 'Match your brand perfectly. Choose position, colors, dark mode support, and even custom button labels.',
    icon: '🎨',
  },
  {
    title: 'Email Notifications',
    desc: 'Get notified when new feedback comes in. Stay on top of issues without constantly checking the dashboard.',
    icon: '📧',
  },
  {
    title: 'Public Roadmap',
    desc: 'Share a public roadmap with your users. Let them vote on features and track progress transparently.',
    icon: '🗺️',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            PinPoint
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-center text-4xl font-bold text-gray-900 dark:text-white">
          Everything you need to collect feedback
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
          PinPoint gives developers and teams a complete feedback collection platform — from widget to resolution.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-blue-600 py-24 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to simplify your feedback workflow?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Get started free — no credit card required. Set up in under 5 minutes.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PinPoint. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
