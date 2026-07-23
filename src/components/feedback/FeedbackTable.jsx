'use client';

import { useMemo } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { calculateColumnWidths } from '@/lib/columnWidths';
import { DataTable } from '@/components/common/DataTable';
import { FeedbackInlineField, STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/feedback/FeedbackInlineField';

const STATUS_DOT = {
  new: 'bg-gray-400',
  open: 'bg-orange-500',
  in_progress: 'bg-blue-500',
  testing: 'bg-purple-500',
  done: 'bg-emerald-500',
  closed: 'bg-gray-400',
};

const PRIORITY_ICON = {
  critical: { icon: ArrowUp, color: 'text-red-600' },
  high: { icon: ArrowUp, color: 'text-orange-500' },
  medium: { icon: Minus, color: 'text-yellow-500' },
  low: { icon: ArrowDown, color: 'text-emerald-500' },
};

const STATUS_LABEL = {
  new: 'New',
  open: 'Open',
  in_progress: 'In Progress',
  testing: 'Testing',
  done: 'Done',
  closed: 'Closed',
};

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '')}&background=2563eb&color=fff&size=24`;
}

function StatusDot({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[value] || STATUS_DOT.new)} />
      <span className="text-xs font-medium text-foreground">{STATUS_LABEL[value] || value}</span>
    </span>
  );
}

function PriorityIcon({ value }) {
  const cfg = PRIORITY_ICON[value] || PRIORITY_ICON.medium;
  const Icon = cfg.icon;
  return <Icon size={14} className={cn('shrink-0', cfg.color)} />;
}

function AssigneeAvatar({ assignee, size = 'sm' }) {
  if (!assignee?.id) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-card">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
    );
  }
  const name = assignee.name || 'Unknown';
  return (
    <img
      src={assignee.avatarUrl || getAvatarUrl(name)}
      alt={name}
      className="h-6 w-6 rounded-full border border-border object-cover shrink-0"
      title={name}
    />
  );
}

export function FeedbackTable({
  feedback = [],
  loading = false,
  pagination,
  onPageChange,
  onRowClick,
  members = [],
  showProject = false,
  compact = true,
  emptyState,
}) {
  const memberOptions = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.User?.id || m.userId,
      label: m.User?.name || 'Unknown',
    })),
  ], [members]);

  const columns = useMemo(() => {
    const cols = [];

    cols.push({
      key: 'title',
      header: 'Issue',
      sortable: true,
      flex: true,
      render: (item) => (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {item.title || item.comment?.slice(0, 80) || 'Untitled'}
          </p>
          <p className="truncate text-xs text-muted-foreground mt-0.5 font-mono">
            {item.pageUrl ? (() => { try { return new URL(item.pageUrl).pathname; } catch { return item.pageUrl; } })() : '—'}
          </p>
        </div>
      ),
      measureFn: (item) => item.title || item.comment || '',
    });

    cols.push({
      key: 'status',
      header: 'Status',
      measureFn: (item) => STATUS_LABEL[item.status] || item.status || 'In Progress',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="status"
          value={item.status}
          options={STATUS_OPTIONS}
          renderDisplay={(v) => <StatusDot value={v} />}
        />
      ),
    });

    cols.push({
      key: 'priority',
      header: 'Priority',
      fixedWidth: '40px',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="priority"
          value={item.priority}
          options={PRIORITY_OPTIONS}
          renderDisplay={(v) => <PriorityIcon value={v} />}
        />
      ),
    });

    cols.push({
      key: 'assignee',
      header: 'Assignee',
      fixedWidth: '40px',
      render: (item) => (
        <FeedbackInlineField
          feedbackId={item.id}
          field="assigneeId"
          value={item.assignee?.id || ''}
          options={memberOptions}
          renderDisplay={(v) => {
            if (v) {
              const member = members.find((m) => (m.User?.id || m.userId) === v);
              if (member) {
                return <AssigneeAvatar assignee={{ id: member.User?.id || member.userId, name: member.User?.name, avatarUrl: member.User?.avatarUrl }} />;
              }
              if (item.assignee?.id === v) {
                return <AssigneeAvatar assignee={item.assignee} />;
              }
            }
            return <AssigneeAvatar assignee={null} />;
          }}
        />
      ),
    });

    cols.push({
      key: 'createdAt',
      header: 'Created',
      measureFn: (item) => formatRelativeTime(item.createdAt || item.created_at),
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(item.createdAt || item.created_at)}
        </span>
      ),
    });

    if (showProject) {
      cols.push({
        key: 'Website.Project.name',
        header: 'Project',
        measureFn: (item) => item.Website?.Project?.name || '',
        render: (item) => {
          const project = item.Website?.Project;
          return project ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              {project.color && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
              )}
              <span className="truncate">{project.name}</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      });
    }

    return feedback.length > 0 ? calculateColumnWidths(feedback, cols) : cols;
  }, [memberOptions, members, showProject, feedback]);

  return (
    <DataTable
      columns={columns}
      data={feedback}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
      density={compact ? 'compact' : 'comfortable'}
      responsiveCards={true}
      emptyState={emptyState}
    />
  );
}
