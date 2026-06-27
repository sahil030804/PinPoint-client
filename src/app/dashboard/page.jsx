"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useWorkspaceStats } from "@/hooks/useFeedback";
import { useFeedbackTrends, useActivityFeed } from "@/hooks/useWorkspace";
import { PageHeader } from "@/components/common/PageHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ACTION_ICONS = {
  created: "📍",
  assigned: "👤",
  unassigned: "🚫",
  status_changed: "🔄",
  priority_changed: "⚡",
  comment_added: "💬",
  resolved: "✅",
  reopened: "🔓",
};

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value ?? "—"}</p>
    </div>
  );
}

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useWorkspaceStats(
    user?.workspaceId,
  );
  const { data: trends = [], isLoading: trendsLoading } = useFeedbackTrends(
    user?.workspaceId,
  );
  const { data: activities = [], isLoading: activityLoading } = useActivityFeed(
    user?.workspaceId,
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your feedback overview."
      />

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Feedback"
            value={stats?.totalFeedback}
            color="text-gray-900 dark:text-white"
          />
          <StatCard label="Open" value={stats?.open} color="text-blue-600" />
          <StatCard
            label="Resolved"
            value={stats?.resolved}
            color="text-green-600"
          />
          <StatCard
            label="Critical"
            value={stats?.critical}
            color="text-red-600"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Feedback Trend
            </h3>
            <div className="mt-4">
              {trendsLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trends}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      className="text-gray-500"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-gray-500"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--tooltip-bg, #fff)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                  No data yet
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5">
                      {ACTION_ICONS[activity.action] || "•"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white truncate">
                        <span className="font-medium">
                          {activity.actor_name || "Someone"}
                        </span>{" "}
                        {activity.action === "created" && "reported feedback"}
                        {activity.action === "comment_added" && "commented"}
                        {activity.action === "resolved" && "resolved feedback"}
                        {activity.action === "status_changed" &&
                          "changed status"}
                        {activity.action === "priority_changed" &&
                          "changed priority"}
                        {activity.action === "assigned" &&
                          `assigned to ${activity.metadata?.assigneeName || activity.assignee_name || "someone"}`}
                        {activity.action === "unassigned" && "removed assignee"}
                        {activity.action === "reopened" && "reopened feedback"}
                        {![
                          "created",
                          "comment_added",
                          "resolved",
                          "status_changed",
                          "priority_changed",
                          "assigned",
                          "unassigned",
                          "reopened",
                        ].includes(activity.action) &&
                          activity.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.feedback_title || activity.page_url}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                  No activity yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
