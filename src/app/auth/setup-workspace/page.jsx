'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import { ArrowRight, ArrowLeft, Rocket, Plus } from 'lucide-react';

function getSafeRedirect(fallback) {
  const returnTo = sessionStorage.getItem('pp_return_to');
  sessionStorage.removeItem('pp_return_to');
  if (!returnTo || typeof returnTo !== 'string') return fallback;
  if (returnTo.startsWith('/')) return returnTo;
  try {
    const u = new URL(returnTo, window.location.origin);
    if (u.origin === window.location.origin) return returnTo;
  } catch {}
  return fallback;
}

export default function SetupWorkspacePage() {
  const router = useRouter();
  const { user, workspaces, switchWorkspace, refreshWorkspaces } = useAuth();
  const { error: toastError } = useToast();
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.workspaceId && workspaces.length > 0) {
      router.replace(getSafeRedirect('/dashboard'));
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
        router.replace(getSafeRedirect('/dashboard'));
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
    router.replace(getSafeRedirect('/dashboard'));
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 items-center justify-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjYgMCAzLTEuMzQgMy0zcy0xLjM0LTMtMy0zLTMgMS4zNC0zIDMgMS4zNCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8 auth-fade-in">
            <Rocket size={14} className="text-white/80" />
            <span className="text-sm font-medium text-white/90">Quick setup</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight auth-slide-up">
            Your workspace<br />awaits you
          </h2>
          <p className="mt-4 text-lg text-blue-100/80 leading-relaxed auth-slide-up-delay">
            Create a workspace to start collecting visual feedback from your team.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-blue-100/60 auth-slide-up-delay-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Unlimited members
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Free forever
            </span>
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center auth-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Rocket size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome to PinPoint</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up your workspace to get started
            </p>
          </div>

          {!mode && (
            <div className="space-y-4 auth-slide-up">
              <button
                onClick={() => setMode('create')}
                className="w-full group rounded-xl border-2 border-dashed border-border p-8 text-center transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-200">
                  <Plus size={24} />
                </div>
                <p className="text-lg font-semibold text-foreground">Create a Workspace</p>
                <p className="mt-1.5 text-sm text-muted-foreground">Set up a new workspace for your team</p>
              </button>

              {workspaces.length > 0 && (
                <div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-background px-3 text-muted-foreground">or join existing</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleSelect(ws.id)}
                        className="w-full group rounded-xl border border-border p-4 text-left transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.99]"
                      >
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{ws.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to switch to this workspace
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'create' && (
            <div className="saas-card p-6 auth-scale-in">
              <h3 className="text-lg font-semibold text-foreground">Create Workspace</h3>
              <p className="mt-1 text-sm text-muted-foreground">Give your workspace a name to get started.</p>
              <form onSubmit={handleCreate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Workspace name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="saas-input"
                    placeholder="e.g. Acme Corp"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="flex-1 saas-btn-primary h-10 text-sm"
                  >
                    {creating ? 'Creating...' : (
                      <span className="flex items-center justify-center gap-2">
                        Create Workspace
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode(null); setName(''); }}
                    className="saas-btn-secondary h-10 text-sm"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
