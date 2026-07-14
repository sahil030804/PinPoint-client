'use client';

import { useState, useRef, useEffect } from 'react';
import { useUpdateFeedback } from '@/hooks/useFeedback';
import { useToast } from '@/providers/ToastProvider';

export const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'done', label: 'Done' },
  { value: 'closed', label: 'Closed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function FeedbackInlineField({ feedbackId, field, value, options, renderDisplay }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const updateFeedback = useUpdateFeedback();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleChange(newValue) {
    setOpen(false);
    if (newValue === value) return;
    try {
      await updateFeedback.mutateAsync({ id: feedbackId, [field]: newValue });
      const label =
        field === 'assigneeId' ? 'Assignee' :
        field.charAt(0).toUpperCase() + field.slice(1);
      toastSuccess(`${label} updated`);
    } catch {
      const label =
        field === 'assigneeId' ? 'assignee' : field;
      toastError(`Failed to update ${label}`);
    }
  }

  function handleClick(e) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  return (
    <div ref={ref} className="relative inline-block" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleClick}
        className="cursor-pointer rounded transition-colors hover:ring-2 hover:ring-blue-400/50 focus:outline-none"
      >
        {renderDisplay(value)}
      </button>
      {open && (
        <div
          className="absolute left-1/2 z-50 mt-1 min-w-[140px] -translate-x-1/2 rounded-[3px] border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleChange(opt.value); }}
              className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                opt.value === value ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
