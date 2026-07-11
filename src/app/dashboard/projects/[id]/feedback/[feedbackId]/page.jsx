'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import dynamic from 'next/dynamic';
import { useFeedback, useComments, useAddComment, useFeedbackTimeline } from '@/hooks/useFeedback';
import { useUpdateFeedback } from '@/hooks/useFeedback';
import { useWorkspaceMembers } from '@/hooks/useWorkspace';
import { FeedbackTimeline } from '@/components/feedback/FeedbackTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { RadixSelect } from '@/components/common/RadixSelect';
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  Send,
  Paperclip,
  MessageSquare,
  Link as LinkIcon,
  Monitor,
} from 'lucide-react';
import NextLink from 'next/link';

const ScreenshotLightbox = dynamic(() => import('@/components/feedback/ScreenshotLightbox'), { ssr: false });
const ScreenshotAnnotator = dynamic(() => import('@/components/feedback/ScreenshotAnnotator'), { ssr: false });

const STATUSES = ['new', 'open', 'in_progress', 'testing', 'done', 'closed'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];

function ScreenshotViewer({ screenshot, annotations }) {
  const [open, setOpen] = useState(false);
  if (!screenshot) return null;
  const url = typeof screenshot === 'string' ? screenshot : (screenshot.clientUrl || screenshot.serverUrl);
  if (!url) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-[3px] border border-gray-200 dark:border-gray-800">
        <img
          src={url}
          alt="Feedback screenshot"
          className="w-full object-contain max-h-96 cursor-pointer"
          onClick={() => setOpen(true)}
        />
        {annotations?.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {annotations.map((ann, i) => (
              <div
                key={ann.id || i}
                className="absolute pointer-events-auto cursor-pointer"
                style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                onClick={() => setOpen(true)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg ring-2 ring-white dark:ring-gray-900">
                  {ann.number || i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && <ScreenshotLightbox url={url} annotations={annotations} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function getShortId(id) {
  if (!id) return '';
  return id.length > 8 ? id.slice(0, 8) : id;
}

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, workspaceRole } = useAuth();
  const canAssign = ['owner', 'admin', 'developer'].includes(workspaceRole);
  const canEdit = workspaceRole !== 'client' && workspaceRole !== 'viewer';
  const canAnnotate = ['owner', 'admin', 'developer'].includes(workspaceRole);
  const { data: feedback, isLoading } = useFeedback(params.feedbackId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(params.feedbackId);
  const { data: members = [] } = useWorkspaceMembers(user?.workspaceId);
  const addComment = useAddComment();
  const updateFeedback = useUpdateFeedback();
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [annotatorOpen, setAnnotatorOpen] = useState(false);

  async function handleSaveAnnotations(annotations) {
    await updateFeedback.mutateAsync({ id: params.feedbackId, annotations });
    setAnnotatorOpen(false);
  }

  function startEditing() {
    if (!feedback) return;
    setEditStatus(feedback.status);
    setEditPriority(feedback.priority);
    setEditAssignee(feedback.assignee?.id || '');
    setEditing(true);
  }

  async function saveChanges() {
    const updates = {};
    if (editStatus !== feedback.status) updates.status = editStatus;
    if (editPriority !== feedback.priority) updates.priority = editPriority;
    if (canAssign && editAssignee !== (feedback.assignee?.id || '')) {
      updates.assigneeId = editAssignee || null;
    }
    if (Object.keys(updates).length > 0) {
      await updateFeedback.mutateAsync({ id: params.feedbackId, ...updates });
    }
    setEditing(false);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment.mutateAsync({ feedbackId: params.feedbackId, body: newComment });
    setNewComment('');
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-32 animate-pulse rounded-[3px] bg-gray-100 dark:bg-gray-800" />
        <div className="h-48 animate-pulse rounded-[3px] bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6 text-center text-gray-500">Feedback not found</div>
    );
  }

  const reporterName = feedback.reporter?.name || feedback.reporterName || 'Anonymous';
  const osBrowser = [feedback.metadata?.os, feedback.metadata?.browser].filter(Boolean).join(' • ');
  const viewport = feedback.metadata?.viewport || '';

  return (
    <div>
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <NextLink href="/dashboard/projects" className="hover:text-gray-700 dark:hover:text-gray-300">
              Projects
            </NextLink>
            <span>/</span>
            <NextLink
              href={`/dashboard/projects/${params.id}`}
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              {feedback.project?.name || `Project`}
            </NextLink>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Feedback #{feedback.displayId || getShortId(feedback.id)}
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <button className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Share2 size={15} />
            Share
          </button>
          <button className="rounded-[3px] p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="p-6 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* LEFT: Main content */}
        <div className="space-y-8">
          {/* Reported Screenshot */}
          <div className="rounded-[3px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reported Screenshot</h2>
              {feedback.screenshot && canAnnotate && (
                <button
                  onClick={() => setAnnotatorOpen(true)}
                  className="rounded-[3px] bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 active:scale-[0.97] transition-transform"
                >
                  {feedback.annotations?.length ? 'Edit Annotations' : 'Annotate Screenshot'}
                </button>
              )}
            </div>
            <div className="p-6">
              <ScreenshotViewer screenshot={feedback.screenshot} annotations={feedback.annotations} />
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-[3px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Comments ({comments.length})</h2>
            </div>

            <div className="px-6 py-4 space-y-5">
              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-[3px] bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {comment.author?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            const diff = Date.now() - new Date(comment.createdAt).getTime();
                            const mins = Math.floor(diff / 60000);
                            const hours = Math.floor(diff / 3600000);
                            if (mins < 1) return 'just now';
                            if (mins < 60) return `${mins} min ago`;
                            if (hours < 24) return `${hours} hours ago`;
                            return new Date(comment.createdAt).toLocaleDateString();
                          })()}
                        </span>
                        {/* Check if this comment author is the feedback assignee or reporter */}
                        {(comment.author?.id === feedback.assignee?.id) && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                            Maintainer
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No comments yet" />
              )}
            </div>

            <form onSubmit={handleAddComment} className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  {user?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    rows={1}
                    className="block w-full resize-none rounded-[3px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    placeholder="Add a comment..."
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      className="rounded-[3px] p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Paperclip size={16} />
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addComment.isPending}
                      className="inline-flex items-center gap-1.5 rounded-[3px] bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
                    >
                      {addComment.isPending ? 'Sending...' : 'Send'}
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-6">
          {/* Title + Reporter */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{feedback.title || 'Untitled Feedback'}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Reported by {reporterName}
            </p>
          </div>

          {/* Details (Status, Priority, Assignee) */}
          <div className="rounded-[3px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Details</h3>
              {!editing && canEdit && (
                <button
                  onClick={startEditing}
                  className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="px-5 py-4">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                    <RadixSelect
                      value={editStatus}
                      onChange={setEditStatus}
                      options={STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
                      triggerClassName="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Priority</label>
                    <RadixSelect
                      value={editPriority}
                      onChange={setEditPriority}
                      options={PRIORITIES}
                      triggerClassName="w-full"
                    />
                  </div>
                  {canAssign && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Assignee</label>
                      <RadixSelect
                        value={editAssignee}
                        onChange={setEditAssignee}
                        options={[
                          { value: '', label: 'Unassigned' },
                          ...members.map((m) => ({
                            value: m.User?.id || m.userId,
                            label: m.User?.name || 'Unknown',
                          })),
                        ]}
                        triggerClassName="w-full"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveChanges}
                      disabled={updateFeedback.isPending}
                      className="rounded-[3px] bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
                    >
                      {updateFeedback.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="rounded-[3px] border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 active:scale-[0.97] transition-transform"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <StatusBadge status={feedback.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Priority</span>
                    <PriorityBadge priority={feedback.priority} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Reporter</span>
                    <span className="text-sm text-gray-900 dark:text-white truncate ml-2">{reporterName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Assignee</span>
                    <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                      {feedback.assignee?.name || <span className="text-gray-400">Unassigned</span>}
                    </span>
                  </div>
                  {feedback.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {feedback.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Environment Context */}
          <div className="rounded-[3px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Environment context</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {feedback.pageUrl && (
                <div className="flex items-start gap-2.5">
                  <LinkIcon size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500">Page URL</span>
                    <p className="text-sm text-gray-900 dark:text-white truncate">{feedback.pageUrl}</p>
                  </div>
                </div>
              )}
              {osBrowser && (
                <div className="flex items-start gap-2.5">
                  <Monitor size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500">OS & Browser</span>
                    <p className="text-sm text-gray-900 dark:text-white">{osBrowser}</p>
                  </div>
                </div>
              )}
              {viewport && (
                <div className="flex items-start gap-2.5">
                  <Monitor size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500">Viewport</span>
                    <p className="text-sm text-gray-900 dark:text-white">{viewport}</p>
                  </div>
                </div>
              )}
              {!feedback.pageUrl && !osBrowser && !viewport && (
                <p className="text-sm text-gray-400 italic">No environment data captured</p>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-[3px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h3>
            </div>
            <div className="px-5 py-4">
              <FeedbackTimeline feedbackId={params.feedbackId} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {annotatorOpen && (
          <ScreenshotAnnotator
            url={typeof feedback.screenshot === 'string' ? feedback.screenshot : (feedback.screenshot.clientUrl || feedback.screenshot.serverUrl)}
            initialAnnotations={feedback.annotations || []}
            onSave={handleSaveAnnotations}
            onClose={() => setAnnotatorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
