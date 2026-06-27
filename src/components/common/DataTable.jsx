'use client';

import { useState, useMemo } from 'react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { EmptyState } from './EmptyState';

export function DataTable({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onRowClick,
  emptyState,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(dir);
    if (onSort) onSort(key, dir);
  }

  if (loading) {
    return (
      <div className="animate-pulse overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div
                      className="h-4 rounded bg-gray-100 dark:bg-gray-800"
                      style={{ width: `${70 + ((col.key.length + i) % 3) * 10}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return emptyState || <EmptyState title="No data" description="No items match your criteria." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                  col.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''
                }`}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-gray-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 active:scale-95 transition-transform dark:border-gray-600"
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 active:scale-95 transition-transform dark:border-gray-600"
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
