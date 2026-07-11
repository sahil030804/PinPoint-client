import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import "@/styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  title: {
    default: "PinPoint — Visual Website Feedback",
    template: "%s — PinPoint",
  },
  description:
    "Click anywhere. Leave feedback. Ship faster. The simplest way to collect visual website feedback.",
  openGraph: {
    title: "PinPoint — Visual Website Feedback",
    description: "Click anywhere. Leave feedback. Ship faster.",
    siteName: "PinPoint",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(geist.variable, geistMono.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('pp_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{ __html: `
window.PINPOINT_API_URL = "http://localhost:4000/v1";
` }} />
        <script src="/widget.js" />
        <script dangerouslySetInnerHTML={{ __html: `
Feedback.init({
  projectId: "eadb9cdc-2f3c-4057-892f-50befdb085b8",
  color: "#3B82F6",
  position: "bottom-right",
  buttonText: "Help",
  icon: "chat"
});
` }} />
      </body>
    </html>
  );
}
