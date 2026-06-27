import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            PinPoint
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Click anywhere.
          <br />
          <span className="text-blue-600 dark:text-blue-400">Leave feedback. Ship faster.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          No more back-and-forth. PinPoint gives developers everything they need —
          exact page, coordinates, browser, screenshot — in one click.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-500"
          >
            Start Free Trial
          </Link>
          <Link
            href="/features"
            className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            See Features
          </Link>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="border-t border-gray-200 bg-gray-50 py-24 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Old Way</h2>
              <ul className="mt-6 space-y-4">
                {['Client takes screenshot → WhatsApp → "Which page?"',
                  '"Desktop or mobile?" → "Which browser?" → "Which button?"',
                  'Developer spends 30 minutes reproducing the issue',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1 text-red-500">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The PinPoint Way</h2>
              <ul className="mt-6 space-y-4">
                {['Visitor clicks feedback button → clicks on issue → types comment',
                  'Screenshot, URL, browser, OS, viewport captured automatically',
                  'Developer gets everything needed in one feedback card',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1 text-green-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Everything you need to collect feedback
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { title: 'Visual Feedback', desc: 'Click anywhere on the page to pin feedback. No more vague descriptions.' },
              { title: 'Auto Screenshots', desc: 'Every submission includes a screenshot. Browser metadata captured automatically.' },
              { title: 'Feedback Timeline', desc: 'See exactly who did what and when. Full audit trail for every ticket.' },
              { title: 'Kanban Workflow', desc: 'Track feedback from New → In Progress → Done. Assign, prioritize, tag.' },
              { title: 'Team Collaboration', desc: 'Invite members, assign tickets, add comments. Workspaces keep projects organized.' },
              { title: 'Instant Setup', desc: 'Install one script. Customize the widget color, position, and text.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 bg-blue-600 py-24 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ship better websites, faster</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of teams using PinPoint to eliminate feedback friction.
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

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PinPoint. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
