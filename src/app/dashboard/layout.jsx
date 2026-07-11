'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Inbox, FolderKanban, UserCheck, CheckCircle, Settings, Users, Bell, X, ChevronDown, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useInvitations, useAcceptInvitation, useRejectInvitation } from '@/hooks/useWorkspace';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Assigned to me', href: '/dashboard/assigned', icon: UserCheck },
  { label: 'Resolved', href: '/dashboard/resolved', icon: CheckCircle },
];

const NAV_ITEMS_BOTTOM = [
  { label: 'Members', href: '/dashboard/members', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function isActive(pathname, href) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

function SidebarNavItem({ item, pathname }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      prefetch={true}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon
        size={18}
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span>{item.label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
      )}
    </Link>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedInvites, setDismissedInvites] = useState(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, workspaces, activeWorkspaceId, switchWorkspace, logout, refreshWorkspaces } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { onActivity } = useWebSocket();
  const queryClient = useQueryClient();
  const { data: pendingInvitations = [] } = useInvitations();
  const acceptInvite = useAcceptInvitation();
  const rejectInvite = useRejectInvitation();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/count');
      if (res.success) {
        setUnreadCount(res.data.count);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (!loading && user && !activeWorkspaceId) {
      sessionStorage.setItem('pp_return_to', pathname);
      router.replace('/auth/setup-workspace');
    }
  }, [loading, user, activeWorkspaceId, router, pathname]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!onActivity) return;
    const cleanup = onActivity(() => {
      setUnreadCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    });
    return cleanup;
  }, [onActivity, queryClient]);

  if (loading || !user) {
    return (
      <div className="flex h-screen animate-pulse bg-page">
        <aside className="hidden w-64 border-r border-border bg-card lg:block">
          <div className="flex h-16 items-center border-b border-border px-5">
            <div className="h-5 w-20 rounded-lg bg-muted" />
          </div>
          <nav className="space-y-1 p-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/50" />
            ))}
          </nav>
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-end border-b border-border bg-card px-5">
            <div className="h-8 w-8 rounded-full bg-muted" />
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              <div className="h-6 w-40 rounded-lg bg-muted" />
              <div className="h-4 w-56 rounded-lg bg-muted/50" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-page">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card z-50">
        {/* Workspace header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" className="text-lg font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity">
            PinPoint
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="relative border-b border-border px-3 py-2">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted transition-colors"
          >
            <span className="truncate">{activeWorkspace?.name || 'SELECT WORKSPACE'}</span>
            <ChevronDown size={14} className={cn('shrink-0 transition-transform', switcherOpen && 'rotate-180')} />
          </button>
          {switcherOpen && (
            <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              {workspaces.length === 0 ? (
                <div className="px-4 py-3">
                  <Link href="/auth/setup-workspace" className="text-sm text-primary hover:text-primary/80 font-medium">
                    Create or join a workspace
                  </Link>
                </div>
              ) : (
                <div className="py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => { switchWorkspace(ws.id); setSwitcherOpen(false); }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                        ws.id === activeWorkspaceId
                          ? 'text-primary bg-primary/5'
                          : 'text-foreground'
                      )}
                    >
                      <span className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        ws.id === activeWorkspaceId ? 'bg-primary' : 'bg-muted-foreground/30'
                      )} />
                      <span className="truncate font-medium">{ws.name}</span>
                      {ws.id === activeWorkspaceId && (
                        <svg className="ml-auto h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Bottom nav + user */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          {NAV_ITEMS_BOTTOM.map((item) => (
            <SidebarNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* User profile */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <Link
              href="/dashboard/inbox"
              className="relative flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Mobile workspace header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="text-lg font-bold text-foreground tracking-tight">
            PinPoint
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Mobile workspace switcher */}
        <div className="relative border-b border-border px-3 py-2">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted"
          >
            <span className="truncate">{activeWorkspace?.name || 'SELECT WORKSPACE'}</span>
            <ChevronDown size={14} className={cn('shrink-0 transition-transform', switcherOpen && 'rotate-180')} />
          </button>
          {switcherOpen && (
            <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <div className="py-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { switchWorkspace(ws.id); setSwitcherOpen(false); setSidebarOpen(false); }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                      ws.id === activeWorkspaceId
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground'
                    )}
                  >
                    <span className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      ws.id === activeWorkspaceId ? 'bg-primary' : 'bg-muted-foreground/30'
                    )} />
                    <span className="truncate font-medium">{ws.name}</span>
                    {ws.id === activeWorkspaceId && (
                      <svg className="ml-auto h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {[...NAV_ITEMS, ...NAV_ITEMS_BOTTOM].map((item) => (
            <div key={item.href} onClick={() => setSidebarOpen(false)}>
              <SidebarNavItem item={item} pathname={pathname} />
            </div>
          ))}
        </nav>

        {/* Mobile user */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <button
              onClick={() => { toggleTheme(); setSidebarOpen(false); }}
              className="flex-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              onClick={() => { logout(); setSidebarOpen(false); }}
              className="flex-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/inbox"
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors lg:hidden"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors hidden lg:flex"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Invitation banner */}
          {pendingInvitations.filter((inv) => !dismissedInvites.has(inv.id)).length > 0 && (
            <div className="border-b border-primary/20 bg-primary/5 px-4 sm:px-5 py-3">
              {pendingInvitations.filter((inv) => !dismissedInvites.has(inv.id)).map((inv) => (
                <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                  <p className="text-foreground">
                    You&apos;ve been invited to <strong className="font-semibold">{inv.Workspace?.name || 'a workspace'}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await acceptInvite.mutateAsync(inv.id);
                        refreshWorkspaces();
                        setDismissedInvites((prev) => new Set(prev).add(inv.id));
                      }}
                      disabled={acceptInvite.isPending}
                      className="saaS-btn-primary disabled:opacity-50 h-8 text-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await rejectInvite.mutateAsync(inv.id);
                        setDismissedInvites((prev) => new Set(prev).add(inv.id));
                      }}
                      disabled={rejectInvite.isPending}
                      className="saaS-btn-secondary disabled:opacity-50 h-8 text-xs"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => setDismissedInvites((prev) => new Set(prev).add(inv.id))}
                      className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
