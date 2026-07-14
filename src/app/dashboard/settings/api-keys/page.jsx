'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsTabs } from '@/components/common/SettingsTabs';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Key, Plus, Copy, Trash2, X, Check, RefreshCw, Webhook,
  AlertTriangle, Clock, Edit3, Circle
} from 'lucide-react';

function formatRelativeTime(date) {
  if (!date) return '';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDeliveryTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const oneDay = 86400000;
  if (diff < oneDay && now.getDate() === d.getDate()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diff < 2 * oneDay) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDeliveryId(id) {
  if (!id) return '';
  return `evt_${id.slice(0, 10)}...`;
}

const TABS = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
];

const WEBHOOK_EVENT_OPTIONS = [
  { value: 'feedback.created', label: 'New feedback' },
  { value: 'feedback.updated', label: 'Status changes' },
  { value: 'comment.created', label: 'New comments' },
  { value: 'project.archived', label: 'Project archived' },
];

export default function ApiKeysPage() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('api-keys');

  // API key state
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rollTarget, setRollTarget] = useState(null);

  // Webhook state
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState(['feedback.created']);
  const [webhookMenuOpen, setWebhookMenuOpen] = useState(null);
  const [webhookDeleteConfirm, setWebhookDeleteConfirm] = useState(null);
  const [savingWebhook, setSavingWebhook] = useState(false);

  // ─── API Keys ───

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys', user?.workspaceId],
    queryFn: () => api.get('/api-keys'),
    select: (res) => res.data || [],
    enabled: !!user?.workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (name) => api.post('/api-keys', { name }),
    onSuccess: (res) => {
      if (res.success) {
        setCreatedKey(res.data);
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        toastSuccess('API key created');
      } else {
        toastError(res.error?.message || 'Failed to create API key');
      }
    },
    onError: (err) => toastError(err.message || 'Failed to create API key'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.del(`/api-keys/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        toastSuccess('API key revoked');
        setDeleteConfirm(null);
      } else {
        toastError(res.error?.message || 'Failed to revoke API key');
      }
    },
    onError: (err) => toastError(err.message || 'Failed to revoke API key'),
  });

  const rollMutation = useMutation({
    mutationFn: async (key) => {
      await api.del(`/api-keys/${key.id}`);
      const res = await api.post('/api-keys', { name: key.name });
      return res;
    },
    onSuccess: (res) => {
      if (res.success) {
        setCreatedKey(res.data);
        setRollTarget(null);
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        toastSuccess('New API key created. The old key has been revoked.');
      } else {
        toastError(res.error?.message || 'Failed to roll API key');
      }
    },
    onError: (err) => toastError(err.message || 'Failed to roll API key'),
  });

  // ─── Webhooks ───

  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks', user?.workspaceId],
    queryFn: () => api.get('/webhooks'),
    select: (res) => res.data || [],
    enabled: !!user?.workspaceId,
  });

  const webhookIds = useMemo(() => webhooks.map((w) => w.id), [webhooks]);

  const { data: recentDeliveries = [] } = useQuery({
    queryKey: ['webhook-deliveries', user?.workspaceId, webhookIds],
    queryFn: async () => {
      const results = await Promise.all(
        webhookIds.map((id) => api.get(`/webhooks/${id}/deliveries?limit=5`))
      );
      const all = results.flatMap((r) => r.data || []);
      return all
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    },
    enabled: webhookIds.length > 0 && !!user?.workspaceId,
  });

  // ─── Handlers ───

  async function handleCreate(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatedKey(null);
    await createMutation.mutateAsync(newKeyName.trim());
    setNewKeyName('');
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeCreate() {
    setShowCreate(false);
    setNewKeyName('');
    setCreatedKey(null);
    setCopied(false);
  }

  async function handleRoll(key) {
    setRollTarget(key);
    await rollMutation.mutateAsync(key);
  }

  function toggleWebhookEvent(value) {
    setWebhookEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  }

  async function handleAddWebhook(e) {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setSavingWebhook(true);
    try {
      const res = await api.post('/webhooks', {
        url: webhookUrl.trim(),
        events: webhookEvents,
        isActive: true,
      });
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['webhooks', user?.workspaceId] });
        toastSuccess('Webhook endpoint created');
        setShowAddWebhook(false);
        setWebhookUrl('');
        setWebhookEvents(['feedback.created']);
      } else {
        toastError(res.error?.message || 'Failed to create webhook');
      }
    } catch (err) {
      toastError(err.message || 'Failed to create webhook');
    } finally {
      setSavingWebhook(false);
    }
  }

  async function handleToggleWebhook(webhook) {
    try {
      const res = await api.patch(`/webhooks/${webhook.id}`, {
        isActive: !webhook.isActive,
      });
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['webhooks', user?.workspaceId] });
        toastSuccess(webhook.isActive ? 'Webhook disabled' : 'Webhook enabled');
      } else {
        toastError(res.error?.message || 'Failed to update webhook');
      }
    } catch (err) {
      toastError(err.message || 'Failed to update webhook');
    }
    setWebhookMenuOpen(null);
  }

  async function handleDeleteWebhook(id) {
    try {
      const res = await api.del(`/webhooks/${id}`);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['webhooks', user?.workspaceId] });
        toastSuccess('Webhook endpoint deleted');
        setWebhookDeleteConfirm(null);
      } else {
        toastError(res.error?.message || 'Failed to delete webhook');
      }
    } catch (err) {
      toastError(err.message || 'Failed to delete webhook');
    }
  }

  return (
    <div>
      <PageHeader title="Developer Settings" description="Manage API keys and configure webhooks for integration." />
      <SettingsTabs />

      {/* In-page tabs */}
      <div className="border-b border-border bg-card/50">
        <div className="px-6 sm:px-8">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group relative flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {activeTab === 'api-keys' && (
        <div className="p-4 sm:p-6 max-w-3xl">
          {/* API Keys Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">Production Keys</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                These keys have full access to your production environment.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="saas-btn-primary h-8 text-xs"
            >
              <Plus size={14} />
              Create API Key
            </button>
          </div>

          {/* Keys List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="saas-card p-5 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-48 rounded bg-muted/50" />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-8 w-8 rounded-lg bg-muted" />
                      <div className="h-8 w-8 rounded-lg bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : keys.length === 0 ? (
            <EmptyState
              icon={<Key size={40} />}
              title="No API keys"
              description="Create an API key to access PinPoint programmatically."
            />
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="saas-card p-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Key size={13} />
                        </div>
                        <span className="font-semibold text-sm text-foreground truncate">
                          {key.name}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Active
                        </span>
                      </div>
                      <code className="block text-xs font-mono text-muted-foreground mb-2">
                        {key.keyPrefix}...
                      </code>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Created: {formatDate(key.createdAt)}
                        </span>
                        <span>
                          Last used: {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRoll(key)}
                        title="Roll Key"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                      >
                        <RefreshCw size={12} />
                        Roll Key
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(key)}
                        title="Revoke"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Secret Keys are only displayed once upon creation. If you lose a secret key, you must roll it or create a new one.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="p-4 sm:p-6 max-w-3xl space-y-8">
          {/* Webhook Endpoints */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Endpoints</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure URLs to receive event notifications.
                </p>
              </div>
              <button
                onClick={() => setShowAddWebhook(true)}
                className="saas-btn-primary h-8 text-xs"
              >
                <Plus size={14} />
                Add Endpoint
              </button>
            </div>

            {webhooksLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="saas-card p-5 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-3 w-full rounded bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : webhooks.length === 0 ? (
              <EmptyState
                icon={<Webhook size={40} />}
                title="No webhook endpoints"
                description="Add an endpoint to receive real-time event notifications."
              />
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className={cn(
                      'saas-card p-5 transition-colors',
                      webhook.isActive ? '' : 'opacity-70'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                            webhook.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                          )}>
                            <Webhook size={13} />
                          </div>
                          <span className="font-semibold text-sm text-foreground truncate">
                            {webhook.url ? new URL(webhook.url).hostname : 'Webhook'}
                          </span>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border',
                            webhook.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-muted text-muted-foreground border-border'
                          )}>
                            {webhook.isActive ? 'Live' : 'Disabled'}
                          </span>
                        </div>

                        <code className="block text-xs font-mono text-muted-foreground mb-2 break-all">
                          {webhook.url}
                        </code>

                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span>
                            Events:{' '}
                            {webhook.events && webhook.events.length > 0
                              ? webhook.events.join(', ')
                              : '* (All Events)'}
                          </span>
                        </div>

                        {webhook.lastDelivery && (
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                            <span className={cn(
                              'font-medium',
                              webhook.lastDelivery.status === 'success'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            )}>
                              Success Rate:{' '}
                              {webhook.lastDelivery.status === 'success' ? '99.9%' : 'Failed'}
                            </span>
                            {webhook.lastDelivery.durationMs && (
                              <span>
                                Avg Latency: {webhook.lastDelivery.durationMs}ms
                              </span>
                            )}
                            <span className={cn(
                              'flex items-center gap-1',
                              webhook.isActive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground'
                            )}>
                              <Circle size={6} fill="currentColor" />
                              {webhook.isActive ? 'Listening' : 'Paused'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Menu */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setWebhookMenuOpen(webhookMenuOpen === webhook.id ? null : webhook.id)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                        >
                          <Edit3 size={13} />
                        </button>
                        {webhookMenuOpen === webhook.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setWebhookMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-border bg-card py-1 shadow-lg">
                              <button
                                onClick={() => handleToggleWebhook(webhook)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                              >
                                {webhook.isActive ? (
                                  <><Circle size={12} /> Disable</>
                                ) : (
                                  <><Circle size={12} className="text-emerald-500" /> Enable</>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setWebhookDeleteConfirm(webhook);
                                  setWebhookMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Deliveries */}
          {recentDeliveries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Recent Deliveries</h3>
                <button className="text-[11px] font-medium text-primary hover:underline">
                  View All
                </button>
              </div>
              <div className="saas-card divide-y divide-border overflow-hidden">
                {recentDeliveries.slice(0, 5).map((delivery) => (
                  <div key={delivery.id} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      'flex items-center gap-1.5 font-medium text-xs min-w-[80px]',
                      delivery.status === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      <span className={cn(
                        'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold',
                        delivery.status === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      )}>
                        {delivery.responseCode || (delivery.status === 'success' ? '200' : '503')} {delivery.status === 'success' ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground min-w-[70px]">
                      {formatDeliveryTime(delivery.createdAt)}
                    </span>
                    <code className="text-[11px] font-mono text-muted-foreground min-w-[120px]">
                      {delivery.event}
                    </code>
                    <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">
                      {formatDeliveryId(delivery.id)}
                    </code>
                    {delivery.error && (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                        <AlertTriangle size={11} />
                        {delivery.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── API Key Create Modal ─── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            {createdKey ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">API Key Created</h3>
                  <button onClick={closeCreate} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                    <X size={18} />
                  </button>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 mb-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
                  <code className="flex-1 break-all font-mono text-xs text-foreground">
                    {createdKey.key}
                  </code>
                  <button
                    onClick={() => handleCopy(createdKey.key)}
                    className="shrink-0 saas-btn-primary h-8 text-xs"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={closeCreate}
                    className="saas-btn-primary h-9 text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Create API Key</h3>
                  <button type="button" onClick={closeCreate} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Give your key a descriptive name to identify its purpose.
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline"
                    className="saas-input"
                    autoFocus
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreate}
                    className="saas-btn-secondary h-9 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newKeyName.trim()}
                    className="saas-btn-primary disabled:opacity-50 h-9 text-sm"
                  >
                    <Key size={14} />
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── API Key Revoke Confirmation Modal ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Revoke API Key</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to revoke <strong className="text-foreground">{deleteConfirm.name}</strong>? This action cannot be undone. Any services using this key will lose access immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="saas-btn-secondary h-9 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutateAsync(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="saas-btn-danger disabled:opacity-50 h-9 text-sm"
              >
                <Trash2 size={14} />
                {deleteMutation.isPending ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── API Key Roll Confirmation Modal ─── */}
      {rollTarget && !createdKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Roll API Key</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Rolling <strong className="text-foreground">{rollTarget.name}</strong> will revoke the existing key and create a new one with the same name. Services using the current key will lose access until updated.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRollTarget(null)}
                className="saas-btn-secondary h-9 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoll(rollTarget)}
                disabled={rollMutation.isPending}
                className="saas-btn-primary disabled:opacity-50 h-9 text-sm"
              >
                <RefreshCw size={14} />
                {rollMutation.isPending ? 'Rolling...' : 'Roll Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Webhook Modal ─── */}
      {showAddWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <form onSubmit={handleAddWebhook}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Add Webhook Endpoint</h3>
                <button type="button" onClick={() => { setShowAddWebhook(false); setWebhookUrl(''); setWebhookEvents(['feedback.created']); }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a URL and select events to receive notifications.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.example.com/events"
                    className="saas-input"
                    autoFocus
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Must use HTTPS. Supports Slack-compatible webhooks.
                  </p>
                </div>
                <fieldset>
                  <legend className="text-sm font-medium text-foreground mb-2">Events to receive</legend>
                  <div className="space-y-2.5">
                    {WEBHOOK_EVENT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes(opt.value)}
                          onChange={() => toggleWebhookEvent(opt.value)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddWebhook(false); setWebhookUrl(''); setWebhookEvents(['feedback.created']); }}
                  className="saas-btn-secondary h-9 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWebhook || !webhookUrl.trim()}
                  className="saas-btn-primary disabled:opacity-50 h-9 text-sm"
                >
                  <Webhook size={14} />
                  {savingWebhook ? 'Creating...' : 'Add Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Webhook Delete Confirmation Modal ─── */}
      {webhookDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Delete Webhook Endpoint</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{webhookDeleteConfirm.url ? new URL(webhookDeleteConfirm.url).hostname : 'this endpoint'}</strong>? This will immediately stop all event deliveries to this URL.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setWebhookDeleteConfirm(null)}
                className="saas-btn-secondary h-9 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWebhook(webhookDeleteConfirm.id)}
                className="saas-btn-danger disabled:opacity-50 h-9 text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
