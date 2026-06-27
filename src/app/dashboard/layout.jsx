'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Inbox, FolderKanban, UserCheck, CheckCircle, Settings, Users } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Assigned', href: '/dashboard/assigned', icon: UserCheck },
  { label: 'Resolved', href: '/dashboard/resolved', icon: CheckCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Members', href: '/dashboard/members', icon: Users },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, workspaces, activeWorkspaceId, switchWorkspace, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => {
    if (!loading && user && !activeWorkspaceId) {
      sessionStorage.setItem('pp_return_to', pathname);
      router.replace('/auth/setup-workspace');
    }
  }, [loading, user, activeWorkspaceId, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen animate-pulse bg-gray-50 dark:bg-gray-950">
        <aside className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
          <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
            <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <nav className="space-y-1 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-2.5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </header>
          <main className="flex-1 animate-pulse overflow-y-auto p-6">
            <div className="space-y-2">
              <div className="h-6 w-44 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-60 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-gray-900 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">PinPoint</Link>
        </div>

        {/* Workspace Switcher */}
        <div className="relative border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="truncate">{activeWorkspace?.name || 'Select workspace'}</span>
            <span className="ml-2 text-xs text-gray-400">▼</span>
          </button>
          {switcherOpen && (
            <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {workspaces.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/auth/setup-workspace" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Create or join a workspace
                  </Link>
                </div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { switchWorkspace(ws.id); setSwitcherOpen(false); }}
                    className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      ws.id === activeWorkspaceId
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className={`mr-2 h-2 w-2 rounded-full ${
                      ws.id === activeWorkspaceId ? 'bg-blue-600' : 'bg-gray-400'
                    }`} />
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspaceId && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <nav className="p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="text-xl">☰</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
