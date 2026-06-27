'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useProjects, useCreateProject } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';

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
        <PageHeader title="Projects" description="Manage your projects and websites." />
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Projects" description="Manage your projects and websites.">
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          New Project
        </button>
      </PageHeader>

      <div className="p-6">
        {showCreate && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Project</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="My Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createProject.isPending || !name.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {createProject.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setName(''); setDescription(''); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                </div>
                {project.description && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start collecting feedback."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Create Project
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
