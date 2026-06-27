'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspaceFeedback, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { RadixSelect } from '@/components/common/RadixSelect';
import { ScreenshotThumbnail } from '@/components/feedback/ScreenshotThumbnail';
import { FeedbackInlineField, STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/feedback/FeedbackInlineField';

export default function InboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: members = [] } = useWorkspaceMembers(user?.workspaceId);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', page: 1 });
  const apiFilters = {
    ...filters,
    status: filters.status === 'all' ? '' : filters.status,
    priority: filters.priority === 'all' ? '' : filters.priority,
  };
  const { data, isLoading } = useWorkspaceFeedback(user?.workspaceId, apiFilters);

  const feedback = data?.data || [];
  const pagination = data?.pagination;

  const MEMBER_OPTIONS = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.User?.id || m.userId,
      label: m.User?.name || 'Unknown',
    })),
  ], [members]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

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
          <p className="text-xs text-gray-500">{item.Website?.Project?.name || ''} — {item.pageUrl}</p>
        </div>
      ),
    },
    {
      key: 'pageUrl',
      header: 'Page',
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.pageUrl ? new URL(item.pageUrl).pathname : '—'}
        </span>
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
  ], [members]);

  return (
    <div>
      <PageHeader title="Inbox" description="All feedback submissions">
        <RadixSelect
          value={filters.status}
          onChange={(v) => handleFilterChange('status', v)}
          options={[
            { value: 'all', label: 'All Status' },
            ...STATUS_OPTIONS,
          ]}
          triggerClassName="w-auto"
        />
        <RadixSelect
          value={filters.priority}
          onChange={(v) => handleFilterChange('priority', v)}
          options={[
            { value: 'all', label: 'All Priority' },
            ...PRIORITY_OPTIONS,
          ]}
          triggerClassName="w-auto"
        />
      </PageHeader>

      <div className="p-6">
        <DataTable
          columns={COLUMNS}
          data={feedback}
          loading={isLoading}
          pagination={pagination && pagination.totalPages > 1 ? pagination : undefined}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onRowClick={(item) => {
            const projectId = item.Website?.Project?.id;
            if (projectId) router.push(`/dashboard/projects/${projectId}/feedback/${item.id}`);
          }}
          emptyState={
            <EmptyState
              title="No feedback yet"
              description="Install the widget on your website to start collecting feedback."
            />
          }
        />
      </div>
    </div>
  );
}
