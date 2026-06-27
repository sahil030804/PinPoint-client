'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback, useComments, useAddComment, useFeedbackTimeline } from '@/hooks/useFeedback';
import { useUpdateFeedbackStatus, useWorkspaceMembers } from '@/hooks/useWorkspace';
import { FeedbackTimeline } from '@/components/feedback/FeedbackTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { RadixSelect } from '@/components/common/RadixSelect';
import { ScreenshotLightbox } from '@/components/feedback/ScreenshotLightbox';
import { ScreenshotAnnotator } from '@/components/feedback/ScreenshotAnnotator';

const STATUSES = ['new', 'open', 'in_progress', 'testing', 'done', 'closed'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];

function ScreenshotViewer({ screenshot, annotations }) {
  const [open, setOpen] = useState(false);
  if (!screenshot) return null;
  const url = typeof screenshot === 'string' ? screenshot : (screenshot.clientUrl || screenshot.serverUrl);
  if (!url) return null;

  return (
    <>
      <div
        className="mt-4 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
        onClick={() => setOpen(true)}
      >
        <img
          src={url}
          alt="Feedback screenshot"
          className="w-full object-contain max-h-96"
        />
      </div>
      <AnimatePresence>
        {open && <ScreenshotLightbox url={url} annotations={annotations} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
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
  const updateFeedback = useUpdateFeedbackStatus();
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
        <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6 text-center text-gray-500">Feedback not found</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={feedback.title || 'Untitled Feedback'}
        description={`Reported on ${new Date(feedback.createdAt).toLocaleDateString()}`}
      />

      <div className="p-6 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comment */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {feedback.comment || 'No description provided.'}
            </p>
            {feedback.pageUrl && (
              <a
                href={feedback.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                🔗 {feedback.pageUrl}
              </a>
            )}
            {feedback.metadata && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                {feedback.metadata.browser && <span>Browser: {feedback.metadata.browser}</span>}
                {feedback.metadata.os && <span>OS: {feedback.metadata.os}</span>}
                {feedback.metadata.screen && <span>Screen: {feedback.metadata.screen}</span>}
                {feedback.metadata.viewport && <span>Viewport: {feedback.metadata.viewport}</span>}
              </div>
            )}
            <ScreenshotViewer screenshot={feedback.screenshot} annotations={feedback.annotations} />
          </div>

          {/* Comments */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments ({comments.length})</h3>

            <div className="mt-4 space-y-4">
              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {comment.author?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={!newComment.trim() || addComment.isPending}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
              >
                {addComment.isPending ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
              {!editing && canEdit && (
                <button
                  onClick={startEditing}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <RadixSelect
                    value={editStatus}
                    onChange={setEditStatus}
                    options={STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <RadixSelect
                    value={editPriority}
                    onChange={setEditPriority}
                    options={PRIORITIES}
                    triggerClassName="w-full"
                  />
                </div>
                {canAssign && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
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
                <div className="flex gap-2">
                  <button
                    onClick={saveChanges}
                    disabled={updateFeedback.isPending}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
                  >
                    {updateFeedback.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 active:scale-[0.97] transition-transform"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <StatusBadge status={feedback.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority</span>
                  <PriorityBadge priority={feedback.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Reporter</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {feedback.reporter?.name || feedback.reporterName || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assignee</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {feedback.assignee?.name || <span className="text-gray-400">Unassigned</span>}
                  </span>
                </div>
                {feedback.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
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

          {/* Screenshot actions */}
          {feedback.screenshot && canAnnotate && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Screenshot</h3>
              <p className="mt-1 text-xs text-gray-500">
                {feedback.annotations?.length || 0} annotation{(feedback.annotations?.length || 0) !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setAnnotatorOpen(true)}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.97] transition-transform"
              >
                {feedback.annotations?.length ? 'Edit Annotations' : 'Annotate Screenshot'}
              </button>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h3>
            <div className="mt-4">
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
