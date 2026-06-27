'use client';

import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ScreenshotThumbnail } from '@/components/feedback/ScreenshotThumbnail';

export function FeedbackCard({ feedback, onClick }) {
  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 active:scale-[0.99] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      onClick={() => onClick?.(feedback)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate dark:text-white">
            {feedback.title || 'Untitled Feedback'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
            {feedback.comment}
          </p>
          <p className="mt-1 text-xs text-gray-400 truncate">
            {feedback.pageUrl}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={feedback.status} />
          <PriorityBadge priority={feedback.priority} />
        </div>
      </div>

      {feedback.screenshot && (typeof feedback.screenshot === 'string' || feedback.screenshot.clientUrl || feedback.screenshot.serverUrl) && (
        <div className="mt-3">
          <ScreenshotThumbnail screenshot={feedback.screenshot} size="sm" />
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {feedback.reporterName && (
          <span>by {feedback.reporterName}</span>
        )}
        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
        {feedback.assignee?.name && (
          <span>Assigned to {feedback.assignee.name}</span>
        )}
      </div>
    </div>
  );
}
