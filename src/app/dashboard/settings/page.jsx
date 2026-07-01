'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspace, useUpdateWorkspace, useWorkspaceStats } from '@/hooks/useWorkspace';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

const SETTINGS_TABS = [
  { label: 'General', href: '/dashboard/settings' },
  { label: 'API Keys', href: '/dashboard/settings/api-keys' },
];

const EVENT_OPTIONS = [
  { value: 'feedback.created', label: 'New feedback' },
  { value: 'feedback.updated', label: 'Status changes' },
  { value: 'comment.created', label: 'New comments' },
];

function UsageBar({ current, limit, label }) {
  if (limit === Infinity) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-green-600 dark:text-green-400">Unlimited</span>
      </div>
    );
  }
  const pct = Math.min((current / limit) * 100, 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-blue-500';
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-gray-100">{current} / {limit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const pathname = usePathname();
  const { user, updateUser } = useAuth();
  const { data: workspace, isLoading } = useWorkspace(user?.workspaceId);
  const { data: stats, isLoading: statsLoading } = useWorkspaceStats(user?.workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [saving, setSaving] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState(['feedback.created']);
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhooks, setWebhooks] = useState([]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (workspace?.name) setWorkspaceName(workspace.name);
  }, [workspace]);

  useEffect(() => {
    if (workspace?.theme?.webhooks) {
      setWebhooks(workspace.theme.webhooks);
      const active = workspace.theme.webhooks.find((w) => w.isActive);
      if (active) {
        setWebhookUrl(active.url);
        setWebhookEvents(active.events);
      }
    }
  }, [workspace]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (name !== user?.name) {
        const res = await api.put('/auth/me', { name });
        if (res.success) {
          updateUser({ name: res.data.name });
        } else {
          throw new Error(res.error?.message || 'Failed to update profile');
        }
      }

      if (workspaceName !== workspace?.name) {
        const res = await updateWorkspace.mutateAsync({ id: user?.workspaceId, name: workspaceName });
        if (!res.success) throw new Error(res.error?.message);
      }

      toastSuccess('Settings saved successfully.');
    } catch (err) {
      toastError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveWebhook(e) {
    e.preventDefault();
    setSavingWebhook(true);
    setWebhookSaved(false);

    try {
      const currentActive = webhooks.find((w) => w.isActive);

      if (currentActive) {
        if (!webhookUrl) {
          await api.del(`/webhooks/${currentActive.id}`);
          setWebhooks([]);
          setWebhookEvents(['feedback.created']);
        } else {
          const res = await api.patch(`/webhooks/${currentActive.id}`, {
            url: webhookUrl,
            events: webhookEvents,
            isActive: true,
          });
          if (!res.success) throw new Error(res.error?.message);
        }
      } else if (webhookUrl) {
        const res = await api.post('/webhooks', {
          url: webhookUrl,
          events: webhookEvents,
          isActive: true,
        });
        if (!res.success) throw new Error(res.error?.message);
      }

      const ws = await api.get(`/workspaces/${user?.workspaceId}`);
      if (ws.success) {
        const whs = ws.data?.theme?.webhooks || [];
        setWebhooks(whs);
      }

      setWebhookSaved(true);
      toastSuccess('Webhook saved successfully.');
    } catch (err) {
      toastError(err.message || 'Failed to save webhook');
    } finally {
      setSavingWebhook(false);
    }
  }

  function toggleEvent(value) {
    setWebhookEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="space-y-1">
            <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
        <div className="p-6 max-w-2xl space-y-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-4 space-y-4">
              <div>
                <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-1 h-9 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
              <div>
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-1 h-9 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-4 space-y-4">
              <div>
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-1 h-9 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
          <div className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const isFree = workspace?.plan === 'free' || stats?.plan === 'free';
  const usage = stats?.usage;

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace." />

      <div className="border-b border-gray-200 px-6 dark:border-gray-800">
        <nav className="-mb-px flex gap-6">
          {SETTINGS_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                pathname === tab.href
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workspace</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slack Integration</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send feedback notifications to a Slack channel via webhook.
          </p>

          {webhooks.filter((w) => w.isActive).length > 0 && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Slack webhook is active ({webhooks.filter((w) => w.isActive).length} configured)
            </div>
          )}

          <form onSubmit={handleSaveWebhook} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Notify on</legend>
              <div className="mt-2 space-y-2">
                {EVENT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(opt.value)}
                      onChange={() => toggleEvent(opt.value)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingWebhook}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
              >
                {savingWebhook ? 'Saving...' : 'Save Webhook'}
              </button>
              {webhookSaved && (
                <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
              )}
            </div>
          </form>
        </div>

        {/* Plan & Usage Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan</h3>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isFree
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            }`}>
              {isFree ? 'Free' : 'Pro'}
            </span>
          </div>

          {statsLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ) : usage ? (
            <div className="space-y-4">
              <UsageBar current={usage.feedback.current} limit={usage.feedback.limit} label="Monthly Feedback" />
              <UsageBar current={usage.websites.current} limit={usage.websites.limit} label="Websites" />
              <UsageBar current={usage.members.current} limit={usage.members.limit} label="Team Members" />

              {isFree && (
                <div className="mt-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-900/20 dark:to-blue-900/20">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Upgrade to Pro</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Unlimited feedback, websites, and team members. Remove PinPoint branding from your widget.
                  </p>
                  <a
                    href="mailto:sahil030804@gmail.com?subject=PinPoint%20Pro%20Upgrade"
                    className="mt-3 inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                  >
                    Contact for Upgrade
                  </a>
                </div>
              )}

              {!isFree && (
                <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    You&apos;re on the Pro plan. All features unlocked.
                  </p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    White-label widget is enabled — no PinPoint branding shown.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
