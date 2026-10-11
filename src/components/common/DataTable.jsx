'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let val = obj;
  for (const key of keys) {
    if (val == null) return undefined;
    val = val[key];
  }
  return val;
}

export function DataTable({
  columns,
  data = [],
  loading = false,
  error = null,
  onRetry,
  pagination,
  onPageChange,
  onSort,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onRowClick,
  emptyState,
  density = 'comfortable',
  responsiveCards = false,
}) {
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDir, setInternalSortDir] = useState('asc');
  // When the parent controls sorting (server-side), skip the local sort.
  const controlled = typeof onSort === 'function';
  const sortKey = controlled ? controlledSortKey : internalSortKey;
  const sortDir = controlled ? (controlledSortDir || 'asc') : internalSortDir;

  function handleSort(key) {
    if (controlled) {
      const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      onSort(key, dir);
      return;
    }
    const dir = internalSortKey === key && internalSortDir === 'asc' ? 'desc' : 'asc';
    setInternalSortKey(key);
    setInternalSortDir(dir);
  }

  const sortedData = useMemo(() => {
    if (controlled || !sortKey || !data.length) return data;
    return [...data].sort((a, b) => {
      const aVal = getNestedValue(a, sortKey);
      const bVal = getNestedValue(b, sortKey);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, controlled]);

  if (loading) {
    return (
      <div className={cn('animate-pulse', responsiveCards ? '' : '')}>
        <Table
          containerClassName={cn(
            'rounded-xl border border-border',
            responsiveCards ? 'lg:overflow-x-auto overflow-visible' : 'overflow-x-auto'
          )}
        >
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={density === 'compact' ? 'h-8 px-3 py-1.5' : ''}>
                  <div className="h-3 w-16 rounded-sm bg-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={density === 'compact' ? 'px-3 py-2' : ''}
                  >
                    <div
                      className="h-4 rounded-sm bg-muted"
                      style={{ width: `${70 + ((col.key.length + i) % 3) * 10}%` }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data.length) {
    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load data</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {error?.message || 'Something went wrong while fetching. Please try again.'}
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      );
    }
    return emptyState || <EmptyState title="No data" description="No items match your criteria." />;
  }

  const cellClass = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  const headClass = density === 'compact' ? 'h-8 px-3 py-1.5' : '';

  return (
    <div>
      <div className={cn('rounded-xl border border-border', responsiveCards ? '' : '')}>
        <Table
          className={responsiveCards ? 'responsive-card-table' : ''}
          containerClassName={cn(
            'rounded-none border-0',
            responsiveCards ? '' : ''
          )}
        >
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    headClass,
                    col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-muted-foreground">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        ) : (
                          <ChevronUp size={12} className="opacity-0 group-hover:opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow
                key={item.id || index}
                className={cn(onRowClick ? 'cursor-pointer' : '', density === 'compact' ? '' : '')}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cellClass}
                    data-label={responsiveCards ? col.header : undefined}
                  >
                    {col.render ? col.render(item) : getNestedValue(item, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-2 py-3">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                <ChevronLeft size={14} />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 4) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 3) {
                    pageNum = pagination.totalPages - 6 + i;
                  } else {
                    pageNum = pagination.page - 3 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="xs"
                      onClick={() => onPageChange?.(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
