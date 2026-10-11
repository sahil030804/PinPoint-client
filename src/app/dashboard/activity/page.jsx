'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useActivityFeed } from "@/hooks/useWorkspace";
import { PageHeader } from "@/components/common/PageHeader";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function ActivityPage() {
  const { user } = useAuth();
  const { data: activities = [], isLoading } = useActivityFeed(user?.workspaceId);

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Every action across your workspace, newest first."
      />
      <div className="p-6">
        <div className="rounded-lg border border-border bg-card shadow-sm flex flex-col overflow-hidden">
          <ActivityFeed activities={activities} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
