'use client';

import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  new: { label: 'New', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  open: { label: 'Open', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  in_progress: { label: 'In Progress', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  testing: { label: 'Testing', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  done: { label: 'Done', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  closed: { label: 'Closed', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.class)}>
      {config.label}
    </span>
  );
}
