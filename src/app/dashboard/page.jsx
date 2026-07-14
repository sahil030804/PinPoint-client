"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkspaceStats } from "@/hooks/useFeedback";
import { useFeedbackTrends, useActivityFeed } from "@/hooks/useWorkspace";
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  Zap,
  Bug,
  RotateCcw,
  UserX,
  Mail,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TrendChart = dynamic(
  () => import("@/components/dashboard/TrendChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

const ACTION_ICONS = {
  created: { icon: Bug, color: "text-blue-600 bg-blue-100" },
  assigned: { icon: UserPlus, color: "text-purple-600 bg-purple-100" },
  unassigned: { icon: UserX, color: "text-muted-foreground bg-muted" },
  status_changed: { icon: ArrowRightLeft, color: "text-orange-600 bg-orange-100" },
  priority_changed: { icon: Zap, color: "text-yellow-600 bg-yellow-100" },
  comment_added: { icon: Mail, color: "text-blue-600 bg-blue-100" },
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

function formatRelativeTime(dateString) {
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

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function TrendBadge({ value, className }) {
  if (value == null) return null;
  const isUp = value >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold",
      isUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
    )}>
      <TrendingUp size={14} className={cn(!isUp && "rotate-180")} />
      {isUp ? "+" : ""}{value}%
    </span>
  );
}

function StatCard({ label, value, icon: Icon, iconColor, trend }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
          iconColor || "bg-primary/10 text-primary"
        )}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value ?? "—"}
        </span>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useWorkspaceStats(
    user?.workspaceId
  );
  const { data: trends = [], isLoading: trendsLoading } = useFeedbackTrends(
    user?.workspaceId
  );
  const { data: activities = [], isLoading: activityLoading } = useActivityFeed(
    user?.workspaceId
  );

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your feedback metrics.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Last 30 days</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Feedback"
          value={stats?.totalFeedback}
          icon={MessageSquare}
          trend={12}
        />
        <StatCard
          label="Open"
          value={stats?.open}
          icon={AlertCircle}
          iconColor="text-orange-500 bg-orange-50 dark:bg-orange-950"
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress}
          icon={Clock}
          iconColor="text-blue-500 bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          label="Resolved This Month"
          value={stats?.resolved}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-50 dark:bg-emerald-950"
          trend={5}
        />
      </div>

      {/* Chart & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Feedback Volume Chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Feedback Volume
            </h3>
            <button className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="p-5">
            {trendsLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : trends.length > 0 ? (
              <TrendChart data={trends} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card shadow-sm flex flex-col">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {activityLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : activities.length > 0 ? (
              activities.slice(0, 8).map((activity, index) => {
                const action = ACTION_ICONS[activity.action];
                const label = ACTIVITY_LABELS[activity.action] || activity.action.replace(/_/g, " ");
                const isLast = index === Math.min(activities.length, 8) - 1;

                return (
                  <div
                    key={activity.id}
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
                          {activity.actor_name || "Someone"}
                        </span>{" "}
                        {label}
                        {(activity.action === "assigned" || activity.action === "unassigned") && " "}
                        {activity.action === "assigned" && (
                          <span className="font-medium">
                            {activity.metadata?.assigneeName || activity.assignee_name || "someone"}
                          </span>
                        )}
                        {activity.feedback_id && (
                          <>
                            {" "}
                            <Link
                              href={`/dashboard/projects/${activity.project_id || "unknown"}/feedback/${activity.feedback_id}`}
                              className="font-mono text-primary hover:underline"
                            >
                              #{typeof activity.feedback_id === "string"
                                ? activity.feedback_id.slice(0, 7)
                                : activity.feedback_id}
                            </Link>
                          </>
                        )}
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
              })
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No activity yet
              </div>
            )}
          </div>
          <div className="border-t border-border px-5 py-3 text-center">
            <Link
              href="/dashboard/inbox"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All Activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
