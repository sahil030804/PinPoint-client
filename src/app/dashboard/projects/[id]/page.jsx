'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import dynamic from 'next/dynamic';
import { useProjects, useWebsites, useCreateWebsite, useWorkspaceFeedback } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScreenshotThumbnail } from '@/components/feedback/ScreenshotThumbnail';

const InstallScript = dynamic(() => import('@/components/project/InstallScript'), { ssr: false });
const WidgetConfigForm = dynamic(() => import('@/components/project/WidgetConfigForm'), { ssr: false });

const FEEDBACK_COLUMNS = [
  {
    key: 'screenshot',
    header: 'Screenshot',
    width: '140px',
    render: (item) => <ScreenshotThumbnail screenshot={item.screenshot} annotations={item.annotations} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (item) => <PriorityBadge priority={item.priority} />,
  },
  {
    key: 'title',
    header: 'Issue',
    render: (item) => (
      <div>
        <p className="font-medium text-foreground">{item.title || item.comment?.slice(0, 60)}</p>
        <p className="text-xs text-muted-foreground">{item.pageUrl}</p>
      </div>
    ),
  },
  {
    key: 'assignee',
    header: 'Assignee',
    render: (item) => item.assignee?.name || <span className="text-muted-foreground">—</span>,
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (item) => (
      <span className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
    ),
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects(user?.workspaceId);
  const project = projects.find((p) => p.id === params.id);
  const { data: websites = [], isLoading: websitesLoading } = useWebsites(params.id);
  const { data: feedbackData, isLoading: feedbackLoading } = useWorkspaceFeedback(user?.workspaceId, { projectId: params.id });

  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgetTab, setWidgetTab] = useState('configure');
  const addWebsite = useCreateWebsite();

  const feedback = feedbackData?.data || [];
  const firstWebsite = websites[0];

  async function handleAddWebsite(e) {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    const res = await addWebsite.mutateAsync({ projectId: params.id, url: websiteUrl });
    if (res.success) {
      setShowAddWebsite(false);
      setWebsiteUrl('');
    }
  }

  const updateWebsiteMutation = useMutation({
    mutationFn: ({ websiteId, ...data }) => api.put(`/websites/${websiteId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites', params.id] });
    },
  });

  async function handleSaveWidgetConfig(websiteId, data) {
    await updateWebsiteMutation.mutateAsync({ websiteId, ...data });
  }

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState title="Project not found" description="This project does not exist." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description || 'Project overview'}
      >
        <button
          onClick={() => setShowWidgetModal(true)}
          className="saaS-btn-primary h-9 text-sm"
        >
          Install Widget
        </button>
      </PageHeader>

      <div className="p-6 space-y-8">
        {/* Websites */}
        <div className="saaS-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Websites</h3>
            <button
              onClick={() => setShowAddWebsite(true)}
              className="saaS-btn-primary h-8 text-xs"
            >
              Add Website
            </button>
          </div>

          {showAddWebsite && (
            <form onSubmit={handleAddWebsite} className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">Website URL</label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="saaS-input"
                  placeholder="https://example.com"
                />
              </div>
              <button
                type="submit"
                disabled={addWebsite.isPending}
                className="saaS-btn-primary h-9 text-sm shrink-0"
              >
                {addWebsite.isPending ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddWebsite(false); setWebsiteUrl(''); }}
                className="saaS-btn-secondary h-9 text-sm shrink-0"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="mt-4 space-y-2">
            {websitesLoading ? (
              <div className="h-12 animate-pulse rounded-lg bg-muted" />
            ) : websites.length > 0 ? (
              websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">🌐</span>
                    <span className="text-sm font-medium text-foreground">{website.url}</span>
                    {website.isActive === false && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">Inactive</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No websites added yet</p>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Feedback</h3>
          <DataTable
            columns={FEEDBACK_COLUMNS}
            data={feedback}
            loading={feedbackLoading}
            onRowClick={(item) => router.push(`/dashboard/projects/${params.id}/feedback/${item.id}`)}
            emptyState={
              <EmptyState
                title="No feedback yet"
                description="Install the widget on your website to start collecting feedback."
              />
            }
          />
        </div>
      </div>

      {/* Install Widget Modal */}
      <AnimatePresence>
        {showWidgetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-10 pb-10"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWidgetModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Widget Installation</h2>
                <button
                  onClick={() => setShowWidgetModal(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="border-b border-border px-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setWidgetTab('configure')}
                    className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                      widgetTab === 'configure'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => setWidgetTab('embed')}
                    className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                      widgetTab === 'embed'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Embed Code
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!firstWebsite && (
                  <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
                    Add a website to your project first, then configure and install the widget.
                  </div>
                )}

                {widgetTab === 'configure' && (
                  <div>
                    {firstWebsite ? (
                      <WidgetConfigForm
                        website={firstWebsite}
                        onSave={handleSaveWidgetConfig}
                      />
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No websites yet. Add a website above to configure the widget.
                      </p>
                    )}
                  </div>
                )}

                {widgetTab === 'embed' && (
                  <div>
                    {firstWebsite ? (
                      <InstallScript
                        projectId={params.id}
                        widgetConfig={firstWebsite.widgetConfig}
                      />
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        Add a website first to get your embed code.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
