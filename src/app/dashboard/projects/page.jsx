'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useProjects, useCreateProject } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Plus,
  FolderKanban,
  MoreVertical,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

const AVATAR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function getAvatarColor(name, color) {
  if (color && color !== '#3B82F6') return color;
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: projects = [], isLoading } = useProjects(user?.workspaceId);
  const createProject = useCreateProject();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await createProject.mutateAsync({ workspaceId: user?.workspaceId, name, description });
    if (res.success) {
      setShowCreate(false);
      setName('');
      setDescription('');
      router.push(`/dashboard/projects/${res.data.id}`);
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Projects" description="Manage your active workspace and feedback boards." />
        <div className="p-4 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-5 w-5 rounded bg-muted" />
                </div>
                <div className="mt-4 h-5 w-3/4 rounded bg-muted" />
                <div className="mt-3 h-6 w-28 rounded-full bg-muted" />
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="ml-auto h-5 w-8 rounded-full bg-muted" />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Projects" description="Manage your active workspace and feedback boards.">
        <button
          onClick={() => setShowCreate(true)}
          className="saaS-btn-primary h-9 text-sm"
        >
          <Plus size={16} />
          New Project
        </button>
      </PageHeader>

      <div className="p-4 sm:p-6">
        {showCreate && (
          <div className="mb-6 saas-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Create Project</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add a new project to start collecting feedback.</p>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="saaS-input"
                  placeholder="My Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="saaS-input resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createProject.isPending || !name.trim()}
                  className="saaS-btn-primary disabled:opacity-50 h-9 text-sm"
                >
                  {createProject.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setName(''); setDescription(''); }}
                  className="saaS-btn-secondary h-9 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const initial = (project.name || '?')[0].toUpperCase();
              const bgColor = getAvatarColor(project.name, project.color);
              const unresolved = project.unresolvedCount ?? 0;
              const totalFeedback = project.feedbackCount ?? 0;
              const extraMembers = project.memberCount != null ? Math.max(0, project.memberCount - 1) : null;
              const url = project.url || null;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  className="saas-card p-5 cursor-pointer group relative transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: bgColor }}
                    >
                      {initial}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="rounded-lg p-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                      aria-label="Project menu"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {project.name}
                  </h3>

                  <div className="mt-3">
                    {unresolved > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400">
                        {unresolved} Unresolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                        Up to date
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {url ? (
                      <>
                        <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{url}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No website added</span>
                    )}
                    {extraMembers != null && extraMembers > 0 && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        +{extraMembers}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageSquare size={14} />
                    <span>{totalFeedback} feedback</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<FolderKanban size={40} />}
            title="No projects yet"
            description="Create your first project to start collecting feedback."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="saaS-btn-primary h-9 text-sm"
              >
                <Plus size={16} />
                Create Project
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
