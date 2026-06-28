import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import '@/styles/globals.css';

export const metadata = {
  title: {
    default: 'PinPoint — Visual Website Feedback',
    template: '%s — PinPoint',
  },
  description:
    'Click anywhere. Leave feedback. Ship faster. The simplest way to collect visual website feedback.',
  openGraph: {
    title: 'PinPoint — Visual Website Feedback',
    description: 'Click anywhere. Leave feedback. Ship faster.',
    siteName: 'PinPoint',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('pp_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-gray-950">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        <script dangerouslySetInnerHTML={{
          __html: `window.PINPOINT_API_URL = "https://pinpoint-server-production.up.railway.app/v1";`,
        }} />
        <script src="https://pin-point-client-rho.vercel.app/widget.js" />
        <script dangerouslySetInnerHTML={{
          __html: `
            Feedback.init({
              projectId: "e9597f9d-78d5-4374-9042-af4f2c44ceb2",
              color: "#f73b3b",
              position: "bottom-right",
              buttonText: "Bug Report",
              icon: "bug"
            });
          `,
        }} />
      </body>
    </html>
  );
}
