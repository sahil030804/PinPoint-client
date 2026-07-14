'use client';

import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspaceFeedback, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { useRouter } from 'next/navigation';
import { ScreenshotThumbnail } from '@/components/feedback/ScreenshotThumbnail';
import { FeedbackInlineField, STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/feedback/FeedbackInlineField';

function getPathname(url) {
  try {
    return url ? new URL(url).pathname : '—';
  } catch {
    return '—';
  }
}

export default function AssignedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: members = [] } = useWorkspaceMembers(user?.workspaceId);
  const { data, isLoading } = useWorkspaceFeedback(user?.workspaceId, { assigneeId: user?.id });

  const feedback = data?.data || [];
  const pagination = data?.pagination;

  const MEMBER_OPTIONS = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.User?.id || m.userId,
      label: m.User?.name || 'Unknown',
    })),
  ], [members]);

  const COLUMNS = useMemo(() => [
    {
      key: 'screenshot',
      header: 'Screenshot',
      width: '140px',
      render: (item) => <ScreenshotThumbnail screenshot={item.screenshot} annotations={item.annotations} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="status"
          value={item.status}
          options={STATUS_OPTIONS}
          renderDisplay={(v) => <StatusBadge status={v} />}
        />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="priority"
          value={item.priority}
          options={PRIORITY_OPTIONS}
          renderDisplay={(v) => <PriorityBadge priority={v} />}
        />
      ),
    },
    {
      key: 'title',
      header: 'Issue',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.title || item.comment?.slice(0, 60)}</p>
          <p className="text-xs text-gray-500">{item.Website?.Project?.name || ''} — {item.pageUrl || '—'}</p>
        </div>
      ),
    },
    {
      key: 'pageUrl',
      header: 'Page',
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getPathname(item.pageUrl)}
        </span>
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="assigneeId"
          value={item.assignee?.id || ''}
          options={MEMBER_OPTIONS}
          renderDisplay={(v) => {
            if (!v) return <span className="text-gray-400">—</span>;
            const member = members.find((m) => (m.User?.id || m.userId) === v);
            return <span className="text-sm text-gray-700 dark:text-gray-300">{member?.User?.name || 'Unknown'}</span>;
          }}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ], [members]);

  return (
    <div>
      <PageHeader title="Assigned to me" description="Feedback items assigned to you." />
      <div className="p-6">
        <DataTable
          columns={COLUMNS}
          data={feedback}
          loading={isLoading}
          pagination={pagination}
          onRowClick={(item) => {
            const projectId = item.Website?.Project?.id;
            if (projectId) router.push(`/dashboard/projects/${projectId}/feedback/${item.id}`);
          }}
          emptyState={
            <EmptyState
              title="No assigned feedback"
              description="Feedback items assigned to you will appear here."
            />
          }
        />
      </div>
    </div>
  );
}
