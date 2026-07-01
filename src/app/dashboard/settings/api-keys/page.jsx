'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

const SETTINGS_TABS = [
  { label: 'General', href: '/dashboard/settings' },
  { label: 'API Keys', href: '/dashboard/settings/api-keys' },
];

export default function ApiKeysPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
  }

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

      <div className="p-6 max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.97] transition-transform"
            >
              Create API Key
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Key</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Last Used</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Expires</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-3 text-gray-900 dark:text-white">{key.name}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {key.keyPrefix}...
                      </td>
                      <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                        {key.expiresAt
                          ? new Date(key.expiresAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => setDeleteConfirm(key)}
                          className="text-sm text-red-600 hover:text-red-500 dark:text-red-400"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {createdKey ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Key Created</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Copy this key now. You won't be able to see it again.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                  <code className="flex-1 break-all font-mono text-xs text-gray-900 dark:text-white">
                    {createdKey.key}
                  </code>
                  <button
                    onClick={() => handleCopy(createdKey.key)}
                    className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={closeCreate}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create API Key</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Give your key a descriptive name.
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    autoFocus
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreate}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newKeyName.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revoke API Key</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to revoke <strong>{deleteConfirm.name}</strong>? This action cannot be undone. Any services using this key will lose access immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutateAsync(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
