'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspaceFeedback, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { FeedbackTable } from '@/components/feedback/FeedbackTable';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/feedback/FeedbackInlineField';
import { useToast } from '@/providers/ToastProvider';
import {
  Download,
  Plus,
  Search,
  Filter,
  Flag,
  Folder,
} from 'lucide-react';
import { RadixSelect } from '@/components/common/RadixSelect';

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

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function handlePageChange(page) {
    setFilters((prev) => ({ ...prev, page }));
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
      if (p) projects.set(p.id, p.name);
    }
    return [{ value: 'all', label: 'All Projects' }, ...Array.from(projects.entries()).map(([id, name]) => ({ value: id, label: name }))];
  }, [feedback]);

  const totalItems = pagination?.total || feedback.length;
  const pageSize = pagination?.limit || 25;
  const currentPage = pagination?.page || filters.page;
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
            options={[{ value: 'all', label: 'Status: All' }, ...STATUS_OPTIONS.map((o) => ({ value: o.value, label: `Status: ${o.label}` }))]}
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
            options={[{ value: 'all', label: 'Priority: All' }, ...PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: `Priority: ${o.label}` }))]}
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

      {/* Feedback Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <FeedbackTable
          feedback={feedback}
          loading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowClick={(item) => {
            const projectId = item.Website?.Project?.id || item.project_id;
            if (projectId) router.push(`/dashboard/projects/${projectId}/feedback/${item.id}`);
          }}
          members={members}
          showProject={true}
          compact={true}
        />
      </div>

      {/* Pagination info bar (only shown when there are results) */}
      {!isLoading && feedback.length > 0 && pagination && pagination.totalPages <= 1 && (
        <div className="mt-3 text-sm text-muted-foreground text-center">
          Showing {totalItems} result{totalItems !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
