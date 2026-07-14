'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsTabs } from '@/components/common/SettingsTabs';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';

function formatTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toastSuccess('All notifications marked as read');
    } catch {
      toastError('Failed to mark all as read');
    }
  }

  async function handleMarkRead(id) {
    try {
      await markRead.mutateAsync(id);
    } catch {
      toastError('Failed to mark notification as read');
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace." />
      <SettingsTabs />

      <div className="p-4 sm:p-6 max-w-2xl">
        <div className="saas-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell size={16} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending || unreadCount === 0}
                className="saas-btn-secondary disabled:opacity-50 h-8 text-xs"
              >
                <CheckCheck size={14} />
                Mark All Read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={40} />}
              title="No notifications"
              description="You're all caught up! Notifications will appear here."
            />
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all',
                    n.read
                      ? 'hover:bg-muted/50'
                      : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'
                  )}
                >
                  <div className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    n.read ? 'bg-transparent' : 'bg-primary'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      n.read ? 'text-muted-foreground' : 'font-medium text-foreground'
                    )}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {n.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
