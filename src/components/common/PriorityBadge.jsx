'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { label: 'Highest', icon: ArrowUp, class: 'text-red-500' },
  high: { label: 'High', icon: ArrowUp, class: 'text-orange-500' },
  medium: { label: 'Medium', icon: Minus, class: 'text-yellow-500' },
  low: { label: 'Low', icon: ArrowDown, class: 'text-emerald-500' },
};

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Icon size={14} className={config.class} />
      {config.label}
    </span>
  );
}
