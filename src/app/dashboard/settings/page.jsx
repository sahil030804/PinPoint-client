'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspace, useUpdateWorkspace } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: workspace, isLoading } = useWorkspace(user?.workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (workspace?.name) setWorkspaceName(workspace.name);
  }, [workspace]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
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

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace." />
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
      </div>
    </div>
  );
}
