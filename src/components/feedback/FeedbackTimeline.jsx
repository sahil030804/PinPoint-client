'use client';

import { useFeedbackTimeline } from '@/hooks/useFeedback';

const ACTION_ICONS = {
  created: '📍',
  assigned: '👤',
  unassigned: "🚫",
  status_changed: '🔄',
  priority_changed: '⚡',
  comment_added: '💬',
  resolved: '✅',
  reopened: '🔓',
  tag_added: '🏷️',
  tag_removed: '🏷️',
  duplicate_marked: '🔗',
  screenshot_updated: '📸',
};

function formatRelativeTime(dateString) {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function ActivityItem({ activity }) {
  const icon = ACTION_ICONS[activity.action] || '•';

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
      case 'comment_added':
        return `commented: "${activity.metadata?.preview || ''}..."`;
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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm dark:bg-gray-800">
        {icon}
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
  const { data: activities = [], isLoading } = useFeedbackTimeline(feedbackId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
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
