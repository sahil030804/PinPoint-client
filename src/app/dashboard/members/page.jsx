'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspaceMembers, useInviteMember, useUpdateMember, useRemoveMember } from '@/hooks/useWorkspace';
import { PageHeader } from '@/components/common/PageHeader';
import { RadixSelect } from '@/components/common/RadixSelect';
import {
  Plus, Users, User, Shield, ShieldCheck, Code, Eye,
  MoreVertical, Filter, X, UserPlus,
} from 'lucide-react';
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

const ROLES = ['admin', 'developer', 'viewer', 'client'];

const ALL_ROLES_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'developer', label: 'Developer' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'client', label: 'Client' },
];

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
  const { user, workspaceRole, refreshWorkspaceRole } = useAuth();
  const { data: members = [], isLoading } = useWorkspaceMembers(user?.workspaceId);
  const inviteMember = useInviteMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const [showInvite, setShowInvite] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const canManageMembers = ['owner', 'admin'].includes(workspaceRole);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const { error: toastError, success: toastSuccess } = useToast();

  const filteredMembers = useMemo(() => {
    let result = members;
    if (roleFilter !== 'all') {
      result = result.filter((m) => m.role === roleFilter);
    }
    if (activeOnly) {
      result = result.filter((m) => m.status === 'active' || !m.status);
    }
    return result;
  }, [members, roleFilter, activeOnly]);

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

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
    try {
      await updateMember.mutateAsync({ workspaceId: user?.workspaceId, userId: memberId, role: newRole });
      if (memberId === user?.id) {
        await refreshWorkspaceRole();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update role');
    }
  }

  async function handleRemove(memberId) {
    try {
      await removeMember.mutateAsync({ workspaceId: user?.workspaceId, userId: memberId });
    } catch (err) {
      toastError(err.message || 'Failed to remove member');
    }
  }

  return (
    <div>
      <PageHeader title="Team Members" description="Manage who has access to this workspace and their permission levels.">
        {canManageMembers && (
          <button
            onClick={() => setShowInvite(true)}
            className="saas-btn-primary h-9 text-sm"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </PageHeader>

      <div className="p-4 sm:p-6 space-y-6">
        {showInvite && (
          <div className="saas-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Invite a team member</h3>
                <p className="mt-1 text-sm text-muted-foreground">Send an email invitation to join your workspace.</p>
              </div>
              <button
                onClick={() => { setShowInvite(false); setEmail(''); }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="saas-input"
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <RadixSelect
                  value={role}
                  onChange={setRole}
                  options={ROLES}
                  triggerClassName="w-full sm:w-36"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={inviteMember.isPending}
                  className="saas-btn-primary disabled:opacity-50 h-9 text-sm"
                >
                  {inviteMember.isPending ? 'Inviting...' : 'Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowInvite(false); setEmail(''); }}
                  className="saas-btn-secondary h-9 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground shrink-0" />
              <RadixSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={ALL_ROLES_OPTIONS}
                triggerClassName="w-36"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/30 h-4 w-4"
              />
              <span className="text-sm text-foreground">Active Only</span>
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="saas-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-44 rounded bg-muted/50" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-muted" />
                  <div className="h-5 w-14 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="saas-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No members found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {roleFilter !== 'all' || activeOnly
                ? 'Try adjusting your filters.'
                : 'Invite team members to collaborate.'}
            </p>
          </div>
        ) : (
          <div className="saas-card overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="jira-table-header w-[35%]">Member</th>
                    <th className="jira-table-header w-[18%]">Role</th>
                    <th className="jira-table-header w-[15%]">Status</th>
                    <th className="jira-table-header w-[20%]">Joined</th>
                    <th className="jira-table-header w-[12%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((item) => (
                    <tr key={item.User?.id || item.id} className="jira-table-row border-b border-border last:border-b-0">
                      <td className="jira-table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary shrink-0 ring-2 ring-primary/10">
                            {item.User?.name ? (
                              <span>{item.User.name[0]}</span>
                            ) : (
                              <User size={18} className="text-primary/60" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{item.User?.name || 'Unnamed User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.User?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="jira-table-cell">
                        <RoleBadge role={item.role} />
                      </td>
                      <td className="jira-table-cell">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="jira-table-cell">
                        <span className="text-sm text-muted-foreground">{formatDate(item.joinedAt)}</span>
                      </td>
                      <td className="jira-table-cell text-right">
                        {canManageMembers && item.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-lg p-2 sm:p-1.5 text-muted-foreground hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer touch-manipulation w-8 h-8 flex items-center justify-center bg-transparent border-none" aria-label="Member actions" type="button">
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[200px] p-2">
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Role</div>
                              {['admin', 'developer', 'viewer', 'client'].map((r) => (
                                <DropdownMenuItem key={r} onClick={() => handleRoleChange(item.User?.id, r)} className={item.role === r ? 'bg-primary/10' : ''}>
                                  <span className={`h-2 w-2 rounded-full shrink-0 ${item.role === r ? 'bg-primary' : 'bg-transparent'}`} />
                                  <span className={item.role === r ? '' : 'ml-[10px]'}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => handleRemove(item.User?.id)}>
                                Remove member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border">
              {filteredMembers.map((item) => (
                <div key={item.User?.id || item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary ring-2 ring-primary/10">
                        {item.User?.name ? (
                          <span>{item.User.name[0]}</span>
                        ) : (
                          <User size={18} className="text-primary/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{item.User?.name || 'Unnamed User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.User?.email}</p>
                      </div>
                    </div>
                    {canManageMembers && item.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-2 sm:p-1.5 text-muted-foreground hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer touch-manipulation w-8 h-8 flex items-center justify-center bg-transparent border-none" aria-label="Member actions" type="button">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[200px] p-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Role</div>
                          {['admin', 'developer', 'viewer', 'client'].map((r) => (
                            <DropdownMenuItem key={r} onClick={() => handleRoleChange(item.User?.id, r)} className={item.role === r ? 'bg-primary/10' : ''}>
                              <span className={`h-2 w-2 rounded-full shrink-0 ${item.role === r ? 'bg-primary' : 'bg-transparent'}`} />
                              <span className={item.role === r ? '' : 'ml-[10px]'}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleRemove(item.User?.id)}>
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={item.role} />
                    <StatusPill status={item.status} />
                    <span className="text-xs text-muted-foreground ml-auto">Joined {formatDate(item.joinedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
