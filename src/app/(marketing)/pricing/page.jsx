import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out PinPoint',
      features: ['1 Project', '100 Feedback / month', '2 Team members', 'Guest client submissions', 'Feedback Timeline'],
      cta: 'Get Started',
      href: '/auth/register',
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For growing teams',
      features: [
        'Unlimited projects',
        'Unlimited feedback',
        'Unlimited team members',
        'Custom branding',
        'Email notifications',
        'Public roadmap',
        'CSV/PDF exports',
      ],
      cta: 'Start Free Trial',
      href: '/auth/register?plan=pro',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$49',
      period: '/month',
      description: 'For agencies and scale',
      features: [
        'Everything in Pro',
        'Custom domain',
        'Webhooks',
        'Priority support',
        'White-label',
        'Audit log',
      ],
      cta: 'Contact Sales',
      href: '/auth/register?plan=business',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            PinPoint
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-center text-4xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h1>
        <p className="mt-4 text-center text-lg text-gray-600 dark:text-gray-400">
          Start free. Upgrade when you need more.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? 'border-blue-500 ring-2 ring-blue-500 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="mt-0.5 text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
