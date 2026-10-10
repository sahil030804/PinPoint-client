'use client';

import { CircleDot, Circle, Loader, FlaskConical, CheckCircle2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  new: { label: 'New', variant: 'default', icon: CircleDot },
  open: { label: 'Open', variant: 'primary', icon: Circle },
  in_progress: { label: 'In Progress', variant: 'warning', icon: Loader },
  testing: { label: 'Testing', variant: 'info', icon: FlaskConical },
  done: { label: 'Done', variant: 'success', icon: CheckCircle2 },
  closed: { label: 'Closed', variant: 'ghost', icon: Archive },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} size="sm" className="gap-1.5">
      <Icon size={13} className="shrink-0" />
      {config.label}
    </Badge>
  );
}
