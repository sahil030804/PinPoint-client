'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspaceFeedback, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { FeedbackInlineField, STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/feedback/FeedbackInlineField';
import { useToast } from '@/providers/ToastProvider';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flag,
  Folder,
} from 'lucide-react';
import { RadixSelect } from '@/components/common/RadixSelect';

const STATUS_STYLE = {
  new: 'bg-status-todo-bg text-status-todo-text border-status-todo-text/20',
  open: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  in_progress: 'bg-status-in-progress-bg text-status-in-progress-text border-status-in-progress-text/20',
  testing: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  done: 'bg-status-done-bg text-status-done-text border-status-done-text/20',
  closed: 'bg-muted text-muted-foreground border-border/50',
};

const PRIORITY_STYLE = {
  critical: 'bg-red-600 text-white border-red-600',
  high: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  medium: 'bg-outline-variant/30 text-on-surface-variant border-outline-variant/50',
  low: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
};

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '')}&background=2563eb&color=fff&size=28`;
}

function getPathname(url) {
  try {
    if (!url) return '—';
    const u = new URL(url);
    return u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '');
  } catch {
    return '—';
  }
}

export default function InboxPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();
  const { data: members = [] } = useWorkspaceMembers(user?.workspaceId);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', project: 'all', page: 1 });

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const apiFilters = {
    ...filters,
    search: search || undefined,
    status: filters.status === 'all' ? '' : filters.status,
    priority: filters.priority === 'all' ? '' : filters.priority,
  };

  const { data, isLoading } = useWorkspaceFeedback(user?.workspaceId, apiFilters);

  const feedback = data?.data || [];
  const pagination = data?.pagination;

  const memberMap = useMemo(() => {
    const map = {};
    for (const m of members) {
      const id = m.User?.id || m.userId;
      map[id] = m.User?.name || 'Unknown';
    }
    return map;
  }, [members]);

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

  const handleExportCSV = useCallback(() => {
    const token = localStorage.getItem('pp_token');
    if (!token || !user?.workspaceId) return;
    const params = new URLSearchParams();
    if (apiFilters.status) params.set('status', apiFilters.status);
    if (apiFilters.priority) params.set('priority', apiFilters.priority);
    if (apiFilters.search) params.set('search', apiFilters.search);
    const query = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/feedback/workspace/${user.workspaceId}/export${query ? `?${query}` : ''}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `feedback-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => toastError('Failed to export CSV'));
  }, [user?.workspaceId, apiFilters, toastError]);

  const projectOptions = useMemo(() => {
    const projects = new Map();
    for (const item of feedback) {
      const p = item.Website?.Project;
      if (p) {
        projects.set(p.id, p.name);
      }
    }
    return [{ value: 'all', label: 'All' }, ...Array.from(projects.entries()).map(([id, name]) => ({ value: id, label: name }))];
  }, [feedback]);

  const totalItems = pagination?.total || feedback.length;
  const pageSize = pagination?.limit || 25;
  const currentPage = pagination?.page || filters.page;
  const totalPages = pagination?.totalPages || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and manage incoming visual feedback.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Download size={16} className="text-muted-foreground" />
            Export CSV
          </button>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110"
          >
            <Plus size={16} />
            New Item
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          <RadixSelect
            variant="ghost"
            value={filters.status}
            onChange={(v) => handleFilterChange('status', v)}
            options={[{ value: 'all', label: 'Status: All' }, ...STATUS_OPTIONS.map((o) => ({ ...o, label: `Status: ${o.label}` }))]}
            placeholder="Status: All"
          />
        </div>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-muted-foreground shrink-0" />
          <RadixSelect
            variant="ghost"
            value={filters.priority}
            onChange={(v) => handleFilterChange('priority', v)}
            options={[{ value: 'all', label: 'Priority: All' }, ...PRIORITY_OPTIONS.map((o) => ({ ...o, label: `Priority: ${o.label}` }))]}
            placeholder="Priority: All"
          />
        </div>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-muted-foreground shrink-0" />
          <RadixSelect
            variant="ghost"
            value={filters.project}
            onChange={(v) => handleFilterChange('project', v)}
            options={projectOptions}
            placeholder="Project: All"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 min-w-[200px]">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className="block w-full border-0 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="animate-pulse p-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4 flex items-center gap-4">
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-4 flex-1 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-7 w-7 rounded-full bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Filter size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No feedback yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Install the widget on your website to start collecting feedback.
            </p>
            <Link
              href="/dashboard/projects"
              className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110"
            >
              View Projects
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Priority</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Feedback Title</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Page</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Reporter</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Assignee</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Created</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {feedback.map((item, index) => {
                    const projectId = item.Website?.Project?.id || item.project_id;
                    const isLast = index === feedback.length - 1;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (projectId) {
                            router.push(`/dashboard/projects/${projectId}/feedback/${item.id}`);
                          }
                        }}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/40 group',
                          !isLast && 'divide-x-0'
                        )}
                      >
                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <FeedbackInlineField
                            feedbackId={item.id}
                            field="status"
                            value={item.status}
                            options={STATUS_OPTIONS}
                            renderDisplay={(v) => (
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                                STATUS_STYLE[v] || STATUS_STYLE.new
                              )}>
                                {v === 'in_progress' ? 'In Progress' : (v || 'New').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            )}
                          />
                        </td>

                        {/* Priority */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <FeedbackInlineField
                            feedbackId={item.id}
                            field="priority"
                            value={item.priority}
                            options={PRIORITY_OPTIONS}
                            renderDisplay={(v) => (
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                                PRIORITY_STYLE[v] || PRIORITY_STYLE.medium
                              )}>
                                {(v || 'medium').charAt(0).toUpperCase() + (v || 'medium').slice(1)}
                              </span>
                            )}
                          />
                        </td>

                        {/* Feedback Title */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.title || item.comment?.slice(0, 80) || 'Untitled'}
                          </div>
                        </td>

                        {/* Page */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                            {getPathname(item.pageUrl)}
                          </span>
                        </td>

                        {/* Reporter */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {item.reporter_name || item.reporter?.name || 'Anonymous'}
                            </span>
                            {item.reporter_email && (
                              <span className="text-xs text-muted-foreground">{item.reporter_email}</span>
                            )}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <FeedbackInlineField
                            feedbackId={item.id}
                            field="assigneeId"
                            value={item.assignee?.id || ''}
                            options={MEMBER_OPTIONS}
                            renderDisplay={(v) => {
                              if (!v) {
                                return (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border bg-card text-muted-foreground">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                                  </div>
                                );
                              }
                              const name = memberMap[v] || 'Unknown';
                              return (
                                <img
                                  src={getAvatarUrl(name)}
                                  alt={name}
                                  className="h-7 w-7 rounded-full border border-border object-cover"
                                  title={name}
                                />
                              );
                            }}
                          />
                        </td>

                        {/* Created */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                          {formatRelativeTime(item.createdAt || item.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                            <ChevronRight size={18} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
                  <span className="font-medium text-foreground">{endItem}</span> of{' '}
                  <span className="font-medium text-foreground">{totalItems}</span> results
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:flex-none sm:justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="relative inline-flex items-center rounded-l-md border border-border bg-card px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                        className={cn(
                          'relative inline-flex items-center border px-4 py-2 text-sm font-medium',
                          pageNum === currentPage
                            ? 'z-10 border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:bg-muted'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="relative inline-flex items-center rounded-r-md border border-border bg-card px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
