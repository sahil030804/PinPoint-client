'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useWorkspace, useUpdateWorkspace, useWorkspaceStats } from '@/hooks/useWorkspace';
import { api } from '@/lib/api';
import { SettingsTabs } from '@/components/common/SettingsTabs';
import {
  Camera,
  User,
  Building2,
  Rocket,
  CreditCard,
  Upload,
  Trash2,
  ArrowRight,
  ChevronRight,
  Palette,
  Shield,
  AlertCircle,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function UsageBar({ current, limit, label }) {
  if (limit === Infinity) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">Unlimited</span>
      </div>
    );
  }
  const pct = Math.min((current / limit) * 100, 100);
  const isWarning = pct >= 90;
  const isCaution = pct >= 75 && pct < 90;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground tabular-nums">
          {current.toLocaleString()}
          <span className="text-muted-foreground/60 font-normal"> / {limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isWarning ? 'bg-destructive' : isCaution ? 'bg-amber-500' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} />
          Nearing limit — upgrade to continue uninterrupted
        </p>
      )}
    </div>
  );
}

function SectionCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="flex items-start justify-between border-b border-border/60 px-6 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={16} />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { data: workspace, isLoading } = useWorkspace(user?.workspaceId);
  const { data: stats, isLoading: statsLoading } = useWorkspaceStats(user?.workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  const [workspaceName, setWorkspaceName] = useState('');
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  useEffect(() => {
    if (workspace?.name) setWorkspaceName(workspace.name);
  }, [workspace]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName !== user?.name) {
        const res = await api.put('/auth/me', { name: fullName });
        if (res.success) {
          updateUser({ name: res.data.name });
        } else {
          throw new Error(res.error?.message || 'Failed to update profile');
        }
      }
      toastSuccess('Profile updated successfully.');
    } catch (err) {
      toastError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveWorkspace(e) {
    e.preventDefault();
    setSavingWorkspace(true);
    try {
      if (workspaceName !== workspace?.name) {
        const res = await updateWorkspace.mutateAsync({
          id: user?.workspaceId,
          name: workspaceName,
        });
        if (!res.success) throw new Error(res.error?.message);
      }
      toastSuccess('Workspace settings saved.');
    } catch (err) {
      toastError(err.message || 'Failed to save workspace settings');
    } finally {
      setSavingWorkspace(false);
    }
  }

  const isFree = workspace?.plan === 'free' || stats?.plan === 'free';
  const usage = stats?.usage;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="border-b border-border px-6 py-5">
          <div className="h-7 w-44 rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-72 rounded-lg bg-muted/50" />
        </div>
        <div className="border-b border-border bg-card/50 px-6 py-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="h-7 w-52 rounded-lg bg-muted" />
          <div className="h-4 w-80 rounded-lg bg-muted/50" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border/80 bg-card p-6 space-y-4">
                  <div className="h-5 w-36 rounded-lg bg-muted" />
                  <div className="h-3 w-56 rounded-lg bg-muted/50" />
                  <div className="space-y-3">
                    <div className="h-[42px] w-full rounded-lg bg-muted" />
                    <div className="h-[42px] w-full rounded-lg bg-muted" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-4">
                <div className="h-5 w-28 rounded-lg bg-muted" />
                <div className="space-y-3">
                  <div className="h-12 w-full rounded-lg bg-muted" />
                  <div className="h-12 w-full rounded-lg bg-muted" />
                  <div className="h-12 w-3/4 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="border-b border-border bg-card/30 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">General Settings</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your account, workspace preferences, and subscription.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Palette size={18} />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-background">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      <SettingsTabs />

      {/* ── Content ── */}
      <div className="p-6 space-y-6">
        {/* Section heading */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">Workspace Settings</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your team&apos;s workspace, preferences, and subscription details.
          </p>
        </div>

        {/* Quick nav pills */}
        <div className="flex items-center gap-1.5">
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'workspace', label: 'Workspace' },
            { key: 'billing', label: 'Billing' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                activeSection === key
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Profile */}
            <SectionCard id="profile-section">
              <SectionHeader
                icon={User}
                title="Personal Profile"
                description="Update your personal information and contact details."
              />
              <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5 pb-1">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-white text-xl font-semibold shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <button
                      type="button"
                      onClick={() => toastError('Profile picture upload coming soon.')}
                      className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Camera size={11} />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Profile photo</p>
                    <p className="text-xs text-muted-foreground">PNG or SVG. 256×256px recommended.</p>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="saas-label" htmlFor="settings-first-name">First Name</label>
                    <input
                      id="settings-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="saas-input"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="saas-label" htmlFor="settings-last-name">Last Name</label>
                    <input
                      id="settings-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="saas-input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="saas-label" htmlFor="settings-email">Email Address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="saas-input"
                  />
                  <p className="saas-hint">Contact your admin to change your email.</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="saas-btn-primary"
                  >
                    <Save size={15} />
                    {saving ? 'Saving changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (user?.name) {
                        const parts = user.name.trim().split(' ');
                        setFirstName(parts[0] || '');
                        setLastName(parts.slice(1).join(' ') || '');
                      }
                    }}
                    className="saas-btn-ghost"
                  >
                    <X size={15} />
                    Cancel
                  </button>
                </div>
              </form>
            </SectionCard>

            {/* Workspace Identity */}
            <SectionCard id="workspace-section">
              <SectionHeader
                icon={Building2}
                title="Workspace Identity"
                description="Configure your team&apos;s public-facing details."
              />
              <form onSubmit={handleSaveWorkspace} className="p-6 space-y-5">
                {/* Workspace Name */}
                <div>
                  <label className="saas-label" htmlFor="settings-workspace-name">Workspace Name</label>
                  <input
                    id="settings-workspace-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="saas-input"
                    placeholder="Acme Corp"
                  />
                  <p className="saas-hint">This will appear on your team&apos;s dashboard and notifications.</p>
                </div>

                {/* Workspace Logo */}
                <div>
                  <label className="saas-label">Workspace Logo</label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold shadow-sm ring-1 ring-border/60">
                      {workspaceName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toastError('Logo upload coming soon.')}
                        className="saas-btn-secondary"
                      >
                        <Upload size={14} />
                        Upload Logo
                      </button>
                      <button
                        type="button"
                        onClick={() => toastError('No logo to remove.')}
                        className="saas-btn-secondary"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="saas-hint">Recommended: 256×256px PNG or SVG</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <button
                    type="submit"
                    disabled={savingWorkspace}
                    className="saas-btn-primary"
                  >
                    <Save size={15} />
                    {savingWorkspace ? 'Saving changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceName(workspace?.name || '')}
                    className="saas-btn-ghost"
                  >
                    <X size={15} />
                    Cancel
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Plan & Usage */}
            <SectionCard id="billing-section">
              <SectionHeader
                icon={Rocket}
                title="Plan & Usage"
                action={
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                      isFree
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {isFree ? 'Free' : 'Pro Team'}
                  </span>
                }
              />

              <div className="p-6 space-y-5">
                {/* Plan detail row */}
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isFree ? 'Free Plan' : 'Pro Team Plan'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isFree ? 'Upgrade for more features' : '$49/mo per team'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/30" />
                </div>

                {/* Usage bars */}
                {statsLoading ? (
                  <div className="animate-pulse space-y-4 pt-1">
                    <div className="h-12 w-full rounded-lg bg-muted" />
                    <div className="h-12 w-full rounded-lg bg-muted" />
                    <div className="h-12 w-3/4 rounded-lg bg-muted" />
                  </div>
                ) : usage ? (
                  <div className="space-y-4 pt-1">
                    <UsageBar
                      current={usage.feedback?.current ?? 0}
                      limit={usage.feedback?.limit ?? 100}
                      label="Feedback Pins"
                    />
                    <UsageBar
                      current={usage.websites?.current ?? 0}
                      limit={usage.websites?.limit ?? 100}
                      label="Active Projects"
                    />
                    <UsageBar
                      current={usage.storage?.current ?? 4.2}
                      limit={usage.storage?.limit ?? 5}
                      label="Storage (GB)"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No usage data available.</p>
                )}

                {/* Actions */}
                <div className="space-y-2.5 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => window.location.href = 'mailto:sahil030804@gmail.com?subject=PinPoint%20Upgrade'}
                    className="inline-flex w-full items-center justify-center gap-1.5 saas-btn-primary"
                  >
                    Upgrade Plan
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = 'mailto:sahil030804@gmail.com?subject=PinPoint%20Billing'}
                    className="inline-flex w-full items-center justify-center gap-1.5 saas-btn-ghost"
                  >
                    <CreditCard size={14} />
                    Manage Billing
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Team Security */}
            <SectionCard className="bg-gradient-to-br from-primary/[0.04] via-primary/[0.01] to-transparent">
              <div className="p-5 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Team Security</p>
                    <p className="text-xs text-muted-foreground">Workspace settings</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Manage team permissions, security policies, and workspace access controls from the members page.
                </p>
                <a
                  href="/dashboard/settings/members"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Manage members
                  <ChevronRight size={12} />
                </a>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
