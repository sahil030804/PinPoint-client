'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspaceMembers, useInviteMember, useUpdateMember, useRemoveMember } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsTabs } from '@/components/common/SettingsTabs';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { Plus, Users, X, Mail, User, MoreVertical, Shield, ShieldCheck, Code, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const ROLE_ICONS = {
  owner: Shield,
  admin: ShieldCheck,
  developer: Code,
  viewer: Eye,
  client: User,
};

const ROLE_COLORS = {
  owner: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  developer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  client: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const ROLE_OPTIONS = ['admin', 'developer', 'viewer', 'client'];

function RoleBadge({ role }) {
  const config = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  const Icon = ROLE_ICONS[role] || User;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config}`}>
      <Icon size={12} />
      {role}
    </span>
  );
}

function StatusPill({ status }) {
  const isActive = status === 'active' || !status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      isActive
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
    }`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        isActive ? 'bg-emerald-500' : 'bg-gray-400'
      }`} />
      {isActive ? 'Active' : 'Offline'}
    </span>
  );
}

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
  const canManageMembers = ['owner', 'admin'].includes(user?.workspaceRole || '');

  const filteredMembers = useMemo(() => {
    let result = members;
    return result;
  }, [members]);

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
        <div className="saas-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users size={16} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Team Members</h3>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="saas-btn-primary h-8 text-xs"
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
                  {filteredMembers.map((member) => {
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
                          <RoleBadge role={role} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {canManageMembers && member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded-lg p-2 sm:p-1.5 text-muted-foreground hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer touch-manipulation w-8 h-8 flex items-center justify-center bg-transparent border-none" aria-label="Member actions" type="button">
                                  <MoreVertical size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[200px] p-2">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Role</div>
                                {['admin', 'developer', 'viewer', 'client'].map((r) => (
                                  <DropdownMenuItem key={r} onClick={() => handleRoleChange(member.User?.id, r)} className={member.role === r ? 'bg-primary/10' : ''}>
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${member.role === r ? 'bg-primary' : 'bg-transparent'}`} />
                                    <span className={member.role === r ? '' : 'ml-[10px]'}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => handleRemove(member)}>
                                  Remove member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                  className="saas-input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="saas-input"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInvite(false); setInviteEmail(''); }}
                  className="saas-btn-secondary h-9 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMember.isPending || !inviteEmail.trim()}
                  className="saas-btn-primary disabled:opacity-50 h-9 text-sm"
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
