'use client';

import { cn } from '@/lib/utils';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  medium: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  low: { label: 'Low', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.class)}>
      {config.label}
    </span>
  );
}
