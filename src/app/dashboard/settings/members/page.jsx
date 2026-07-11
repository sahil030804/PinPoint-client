'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspaceMembers, useInviteMember, useUpdateMember, useRemoveMember } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsTabs } from '@/components/common/SettingsTabs';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { Plus, Users, X, Mail, User } from 'lucide-react';
import { RadixSelect } from '@/components/common/RadixSelect';

const ROLE_OPTIONS = ['admin', 'developer', 'viewer', 'client'];

const ROLE_COLORS = {
  owner: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  developer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  client: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function MembersPage() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { data: members = [], isLoading } = useWorkspaceMembers(user?.workspaceId);
  const inviteMember = useInviteMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember.mutateAsync({ workspaceId: user?.workspaceId, email: inviteEmail.trim(), role: inviteRole });
      toastSuccess('Invitation sent');
      setShowInvite(false);
      setInviteEmail('');
    } catch {
      toastError('Failed to send invitation');
    }
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      await updateMember.mutateAsync({ workspaceId: user?.workspaceId, userId: memberId, role: newRole });
      toastSuccess('Role updated');
    } catch {
      toastError('Failed to update role');
    }
  }

  async function handleRemove(member) {
    try {
      await removeMember.mutateAsync({ workspaceId: user?.workspaceId, userId: member.userId });
      toastSuccess('Member removed');
    } catch {
      toastError('Failed to remove member');
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace." />
      <SettingsTabs />

      <div className="p-4 sm:p-6 max-w-2xl">
        <div className="saaS-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users size={16} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Team Members</h3>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="saaS-btn-primary h-8 text-xs"
            >
              <Plus size={14} />
              Invite Member
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="No team members"
              description="Invite your first team member to start collaborating."
            />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const role = member.role || 'viewer';
                    return (
                      <tr key={member.userId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary shrink-0 ring-2 ring-primary/10">
                              {member.User?.name ? (
                                <span>{member.User.name[0]}</span>
                              ) : (
                                <User size={18} className="text-primary/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{member.User?.name || 'Unnamed User'}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.User?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <RadixSelect
                            value={role}
                            onChange={(v) => handleRoleChange(member.userId, v)}
                            disabled={member.userId === user?.id}
                            options={ROLE_OPTIONS.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                            placeholder="Role"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {member.userId !== user?.id && (
                            <button
                              onClick={() => handleRemove(member)}
                              className="text-xs text-destructive hover:text-destructive/80 font-medium active:scale-95 transition-all"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Invite Member</h3>
                <p className="mt-1 text-sm text-muted-foreground">Send an invitation to join this workspace.</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="saaS-input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <RadixSelect
                  value={inviteRole}
                  onChange={setInviteRole}
                  options={ROLE_OPTIONS.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                  placeholder="Select role"
                  triggerClassName="w-full"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInvite(false); setInviteEmail(''); }}
                  className="saaS-btn-secondary h-9 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMember.isPending || !inviteEmail.trim()}
                  className="saaS-btn-primary disabled:opacity-50 h-9 text-sm"
                >
                  <Mail size={14} />
                  {inviteMember.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
