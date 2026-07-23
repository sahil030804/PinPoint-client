'use client';

import { useFeedbackTimeline } from '@/hooks/useFeedback';
import { formatRelativeTime } from '@/lib/utils';
import {
  Bug,
  UserPlus,
  UserX,
  ArrowRightLeft,
  Zap,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Tags,
  Link,
  Camera,
  Dot,
} from 'lucide-react';

const ACTION_ICONS = {
  created: Bug,
  assigned: UserPlus,
  unassigned: UserX,
  status_changed: ArrowRightLeft,
  priority_changed: Zap,
  comment_added: MessageSquare,
  resolved: CheckCircle2,
  reopened: RotateCcw,
  tag_added: Tags,
  tag_removed: Tags,
  duplicate_marked: Link,
  screenshot_updated: Camera,
};

function ActivityItem({ activity }) {
  const IconComponent = ACTION_ICONS[activity.action];

  function getDescription() {
    switch (activity.action) {
      case 'created':
        return 'reported an issue';
      case 'assigned':
        return `assigned to ${activity.metadata?.assigneeName || 'someone'}`;
      case 'unassigned':
        return 'removed assignee';
      case 'status_changed':
        return `moved from ${activity.metadata?.from} → ${activity.metadata?.to}`;
      case 'priority_changed':
        return `priority changed from ${activity.metadata?.from} → ${activity.metadata?.to}`;
      case 'comment_added': {
        const preview = activity.metadata?.preview || '';
        return `commented: "${preview}${preview.length >= 50 ? '...' : ''}"`;
      }
      case 'resolved':
        return 'resolved this issue';
      case 'reopened':
        return 'reopened this issue';
      default:
        return activity.action.replace(/_/g, ' ');
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
        {IconComponent ? <IconComponent size={16} /> : <Dot size={16} />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.actor?.name || 'Someone'}
          </span>
          <span className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{getDescription()}</p>
      </div>
    </div>
  );
}

export function FeedbackTimeline({ feedbackId }) {
  const { data: activities = [], isLoading, isError, refetch } = useFeedbackTimeline(feedbackId);

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-500 mb-2">Failed to load activity timeline</p>
        <button onClick={() => refetch()} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-[3px] bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">No activity yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
