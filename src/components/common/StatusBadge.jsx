'use client';

import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  new: { label: 'New', variant: 'default' },
  open: { label: 'Open', variant: 'primary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  testing: { label: 'Testing', variant: 'info' },
  done: { label: 'Done', variant: 'success' },
  closed: { label: 'Closed', variant: 'ghost' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
