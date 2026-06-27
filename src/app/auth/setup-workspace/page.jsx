'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';

export default function SetupWorkspacePage() {
  const router = useRouter();
  const { user, workspaces, switchWorkspace, refreshWorkspaces } = useAuth();
  const { error: toastError } = useToast();
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.workspaceId && workspaces.length > 0) {
      const returnTo = sessionStorage.getItem('pp_return_to');
      sessionStorage.removeItem('pp_return_to');
      router.replace(returnTo || '/dashboard');
    }
  }, [user, workspaces, router]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/workspaces', { name });
      if (res.success) {
        switchWorkspace(res.data.id);
        await refreshWorkspaces();
        const returnTo = sessionStorage.getItem('pp_return_to');
        sessionStorage.removeItem('pp_return_to');
        router.replace(returnTo || '/dashboard');
      } else {
        toastError(res.error?.message || 'Failed to create workspace');
      }
    } catch (err) {
      toastError(err.message || 'Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  function handleSelect(workspaceId) {
    switchWorkspace(workspaceId);
    const returnTo = sessionStorage.getItem('pp_return_to');
    sessionStorage.removeItem('pp_return_to');
    router.replace(returnTo || '/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to PinPoint</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Set up your workspace to get started
          </p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
            >
              <span className="text-3xl">🚀</span>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Create a Workspace</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set up a new workspace for your team</p>
            </button>

            {workspaces.length > 0 && (
              <div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">or join existing</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleSelect(ws.id)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{ws.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You've been invited to this workspace
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Workspace name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="e.g. Acme Corp"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              {creating ? 'Creating...' : 'Create Workspace'}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-transform dark:border-gray-600 dark:text-gray-300"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
