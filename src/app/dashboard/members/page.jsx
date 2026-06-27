'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspaceMembers, useInviteMember, useUpdateMember, useRemoveMember } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { RadixSelect } from '@/components/common/RadixSelect';

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  developer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  client: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const ROLES = ['admin', 'developer', 'viewer', 'client'];

function RoleBadge({ role }) {
  const config = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config}`}>
      {role}
    </span>
  );
}

export default function MembersPage() {
  const { user, workspaceRole, refreshWorkspaceRole } = useAuth();
  const { data: members = [], isLoading } = useWorkspaceMembers(user?.workspaceId);
  const inviteMember = useInviteMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const [showInvite, setShowInvite] = useState(false);
  const canManageMembers = ['owner', 'admin'].includes(workspaceRole);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const { error: toastError, success: toastSuccess } = useToast();

  async function handleInvite(e) {
    e.preventDefault();
    const res = await inviteMember.mutateAsync({ workspaceId: user?.workspaceId, email, role });
    if (!res.success) {
      toastError(res.error?.message || 'Failed to invite member');
    } else {
      toastSuccess('Invitation sent');
      setShowInvite(false);
      setEmail('');
      setRole('viewer');
    }
  }

  async function handleRoleChange(memberId, newRole) {
    await updateMember.mutateAsync({ workspaceId: user?.workspaceId, userId: memberId, role: newRole });
    if (memberId === user?.id) {
      await refreshWorkspaceRole();
    }
  }

  async function handleRemove(memberId) {
    await removeMember.mutateAsync({ workspaceId: user?.workspaceId, userId: memberId });
  }

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'user',
        header: 'Member',
        width: '45%',
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {item.User?.name?.[0] || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.User?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{item.User?.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        width: '15%',
        render: (item) => <RoleBadge role={item.role} />,
      },
      {
        key: 'joinedAt',
        header: 'Joined',
        width: '20%',
        render: (item) => (
          <span className="text-sm text-gray-500">
            {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : '—'}
          </span>
        ),
      },
    ];

    cols.push({
      key: 'actions',
      header: 'Actions',
      width: '20%',
      render: (item) => (
        <div className="flex items-center gap-2">
          {canManageMembers && item.role !== 'owner' && (
            <>
              <RadixSelect
                value={item.role}
                onChange={(newRole) => handleRoleChange(item.User?.id, newRole)}
                options={ROLES}
                triggerClassName="w-auto rounded-md px-2.5 py-1.5 text-xs"
                itemClassName="text-xs px-3 py-1.5"
              />
                <button
                  onClick={() => handleRemove(item.User?.id)}
                  className="text-xs text-red-600 hover:text-red-500 dark:text-red-400 active:scale-95 transition-transform"
                >
                  Remove
                </button>
            </>
          )}
        </div>
      ),
    });

    return cols;
  }, [canManageMembers]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="space-y-1">
            <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="p-6 space-y-3">
          <div className="flex gap-4 border-b border-gray-200 pb-3 dark:border-gray-800">
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Members" description="Manage your workspace team.">
        {canManageMembers && (
          <button
            onClick={() => setShowInvite(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.97] transition-transform"
          >
            Invite Member
          </button>
        )}
      </PageHeader>

      <div className="p-6">
        {showInvite && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite a team member</h3>
            <form onSubmit={handleInvite} className="mt-4 flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <RadixSelect
                  value={role}
                  onChange={setRole}
                  options={ROLES}
                  triggerClassName="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={inviteMember.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
                >
                  {inviteMember.isPending ? 'Inviting...' : 'Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowInvite(false); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-transform dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <DataTable
          columns={columns}
          data={members}
          loading={isLoading}
          emptyState={
            <EmptyState
              title="No members"
              description="Invite team members to collaborate."
            />
          }
        />
      </div>
    </div>
  );
}
