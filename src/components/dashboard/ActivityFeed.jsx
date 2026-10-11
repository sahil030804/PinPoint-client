'use client';

import Link from "next/link";
import {
  ArrowRightLeft,
  Bell,
  Bug,
  CheckCircle2,
  Mail,
  RotateCcw,
  UserPlus,
  UserX,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_ICONS = {
  created: { icon: Bug, color: "text-primary bg-primary/10" },
  assigned: { icon: UserPlus, color: "text-purple-600 bg-purple-100" },
  unassigned: { icon: UserX, color: "text-muted-foreground bg-muted" },
  status_changed: { icon: ArrowRightLeft, color: "text-orange-600 bg-orange-100" },
  priority_changed: { icon: Zap, color: "text-yellow-600 bg-yellow-100" },
  comment_added: { icon: Mail, color: "text-primary bg-primary/10" },
  resolved: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100" },
  reopened: { icon: RotateCcw, color: "text-orange-600 bg-orange-100" },
};

const ACTIVITY_LABELS = {
  created: "reported feedback",
  comment_added: "commented on",
  resolved: "resolved",
  status_changed: "changed status of",
  priority_changed: "changed priority of",
  assigned: "assigned",
  unassigned: "removed assignee from",
  reopened: "reopened",
};

export function formatRelativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function feedbackHref(activity) {
  if (!activity.feedback_id || !activity.project_id) return null;
  return `/dashboard/projects/${activity.project_id}/feedback/${activity.feedback_id}`;
}

function ActivityItem({ activity, isLast }) {
  const action = ACTION_ICONS[activity.action];
  const label = ACTIVITY_LABELS[activity.action] || activity.action.replace(/_/g, " ");
  const href = feedbackHref(activity);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50",
        !isLast && "border-b border-border/50"
      )}
    >
      {/* Avatar or action icon */}
      {activity.actor_avatar ? (
        <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
          <img
            src={activity.actor_avatar}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : action ? (
        <div className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          action.color
        )}>
          <action.icon size={14} />
        </div>
      ) : (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Bell size={14} />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">
          <span className="font-semibold">
            {activity.actor_name || "A visitor"}
          </span>{" "}
          {label}
          {(activity.action === "assigned" || activity.action === "unassigned") && " "}
          {activity.action === "assigned" && (
            <span className="font-medium">
              {activity.metadata?.assigneeName || activity.assignee_name || "a team member"}
            </span>
          )}
          {href ? (
            <>
              {" "}
              <Link
                href={href}
                className="font-mono text-primary hover:underline"
              >
                #{typeof activity.feedback_id === "string"
                  ? activity.feedback_id.slice(0, 7)
                  : activity.feedback_id}
              </Link>
            </>
          ) : activity.feedback_id ? (
            <>
              {" "}
              <span className="font-mono text-muted-foreground">
                #{typeof activity.feedback_id === "string"
                  ? activity.feedback_id.slice(0, 7)
                  : activity.feedback_id}
              </span>
            </>
          ) : null}
        </p>
        {activity.feedback_title && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {activity.feedback_title}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formatRelativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities = [], loading = false, limit, showViewAll = false }) {
  const visible = limit ? activities.slice(0, limit) : activities;

  return (
    <>
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : visible.length > 0 ? (
          visible.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === visible.length - 1}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No activity yet
          </div>
        )}
      </div>
      {showViewAll && (
        <div className="border-t border-border px-5 py-3 text-center">
          <Link
            href="/dashboard/activity"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All Activity
          </Link>
        </div>
      )}
    </>
  );
}
