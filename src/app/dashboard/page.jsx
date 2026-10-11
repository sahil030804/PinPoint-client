"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalyticsOverview, useFeedbackTrends, useActivityFeed } from "@/hooks/useWorkspace";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RadixSelect } from "@/components/common/RadixSelect";
import {
  MessageSquare,
  AlertCircle,
  Clock,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  Calendar,
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
      isUp ? "bg-[#E2ECE6] text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
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

function trendPct(trends) {
  if (!Array.isArray(trends) || trends.length < 2) return undefined;
  const half = Math.floor(trends.length / 2);
  const prev = trends.slice(0, half).reduce((s, d) => s + (d.count || 0), 0);
  const recent = trends.slice(half).reduce((s, d) => s + (d.count || 0), 0);
  if (prev === 0) return undefined;
  return Math.round(((recent - prev) / prev) * 100);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState('30');
  const { data: stats, isLoading: statsLoading } = useAnalyticsOverview(
    user?.workspaceId
  );
  const { data: trends = [], isLoading: trendsLoading } = useFeedbackTrends(
    user?.workspaceId,
    range
  );
  const { data: activities = [], isLoading: activityLoading } = useActivityFeed(
    user?.workspaceId
  );
  const totalTrend = trendPct(trends);

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
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 shadow-sm">
          <Calendar size={16} className="ml-1 text-muted-foreground" />
          <RadixSelect
            variant="ghost"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
            ]}
            triggerClassName="border-0 shadow-none text-sm text-foreground"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Feedback"
          value={stats?.totalFeedback}
          icon={MessageSquare}
          trend={totalTrend}
        />
        <StatCard
          label="Open"
          value={stats?.open}
          icon={AlertCircle}
          iconColor="text-[#A3805E] dark:text-[#C2A07E] bg-[#F0EBDC] dark:bg-[#2B2718]"
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress}
          icon={Clock}
          iconColor="text-primary bg-primary/10 dark:bg-primary/10"
        />
        <StatCard
          label="In Testing"
          value={stats?.testing}
          icon={FlaskConical}
          iconColor="text-[#7C86A8] dark:text-[#9AA3C7] bg-[#E8EAF3] dark:bg-[#1E2233]"
        />
        <StatCard
          label="Resolved This Month"
          value={stats?.resolvedThisMonth ?? stats?.resolved}
          icon={CheckCircle2}
          iconColor="text-[#6E8F7E] dark:text-[#8DB8A1] bg-[#E2ECE6] dark:bg-[#16271F]"
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
          <ActivityFeed activities={activities} loading={activityLoading} limit={8} showViewAll />
        </div>
      </div>
    </div>
  );
}
