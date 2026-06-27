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
  const widgetProjectId = process.env.NEXT_PUBLIC_WIDGET_PROJECT_ID;

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
        {widgetProjectId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var s = document.createElement('script');
                  s.src = '${process.env.NEXT_PUBLIC_WIDGET_URL || '/widget.js'}';
                  s.onload = function() {
                    Feedback.init({
                      projectId: '${widgetProjectId}',
                      color: '${process.env.NEXT_PUBLIC_WIDGET_COLOR || '#3B82F6'}',
                      position: '${process.env.NEXT_PUBLIC_WIDGET_POSITION || 'bottom-right'}',
                      buttonText: '${process.env.NEXT_PUBLIC_WIDGET_BUTTON_TEXT || 'Feedback'}',
                      icon: '${process.env.NEXT_PUBLIC_WIDGET_ICON || 'chat'}',
                      darkMode: ${process.env.NEXT_PUBLIC_WIDGET_DARK_MODE === 'true'}
                    });
                  };
                  document.head.appendChild(s);
                })();
              `
            }}
          />
        )}
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
      </body>
    </html>
  );
}
