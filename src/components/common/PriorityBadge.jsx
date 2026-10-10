'use client';

import { OctagonAlert, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', icon: OctagonAlert, class: 'text-[#9C6464] dark:text-[#C48F8F]' },
  high: { label: 'High', icon: ArrowUp, class: 'text-[#A3805E] dark:text-[#C2A07E]' },
  medium: { label: 'Medium', icon: Minus, class: 'text-[#76879A] dark:text-[#93A5B8]' },
  low: { label: 'Low', icon: ArrowDown, class: 'text-[#6E8F7E] dark:text-[#8DB8A1]' },
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
