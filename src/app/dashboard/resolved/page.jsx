'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspaceFeedback, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { FeedbackTable } from '@/components/feedback/FeedbackTable';
import { EmptyState } from '@/components/common/EmptyState';

export default function ResolvedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: members = [] } = useWorkspaceMembers(user?.workspaceId);
  const { data, isLoading } = useWorkspaceFeedback(user?.workspaceId, { status: 'done,closed' });

  const feedback = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader title="Resolved" description="Done and closed feedback items." />
      <div className="p-6">
        <FeedbackTable
          feedback={feedback}
          loading={isLoading}
          pagination={pagination}
          onRowClick={(item) => {
            const projectId = item.Website?.Project?.id;
            if (projectId) router.push(`/dashboard/projects/${projectId}/feedback/${item.id}`);
          }}
          members={members}
          showProject={true}
          compact={true}
          emptyState={
            <EmptyState
              title="No resolved feedback"
              description="Resolved feedback items will appear here."
            />
          }
        />
      </div>
    </div>
  );
}
