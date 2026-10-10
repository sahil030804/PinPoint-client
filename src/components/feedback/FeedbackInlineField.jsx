'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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

const MENU_WIDTH = 180;
const MENU_MAX_H = 280;
const GAP = 6;
const EDGE = 8;

function clampLeft(centerX) {
  return Math.max(EDGE, Math.min(centerX - MENU_WIDTH / 2, window.innerWidth - MENU_WIDTH - EDGE));
}

export function FeedbackInlineField({ feedbackId, field, value, options, renderDisplay, label }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const ref = useRef(null);
  const itemRefs = useRef([]);
  const updateFeedback = useUpdateFeedback();
  const { success: toastSuccess, error: toastError } = useToast();

  function close(refocus = false) {
    setOpen(false);
    setPos(null);
    if (refocus) btnRef.current?.focus();
  }

  // Initial position from the trigger rect (runs before paint, no flicker)
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + GAP,
      left: clampLeft(r.left + r.width / 2),
      maxHeight: MENU_MAX_H,
    });
    setFocusIndex(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  // After mount, flip above / shift when the menu would overflow the viewport
  useLayoutEffect(() => {
    if (!open || !pos || !menuRef.current || !btnRef.current) return;
    const menuRect = menuRef.current.getBoundingClientRect();
    const trigRect = btnRef.current.getBoundingClientRect();
    const overflowBottom = menuRect.bottom - (window.innerHeight - EDGE);
    const overflowRight = menuRect.right - (window.innerWidth - EDGE);
    let next = null;
    if (overflowBottom > 0) {
      const above = trigRect.top - GAP - EDGE;
      if (above > menuRect.height / 2) {
        next = { ...(next || pos), top: Math.max(EDGE, trigRect.top - GAP - menuRect.height) };
      } else {
        next = { ...(next || pos), maxHeight: Math.max(120, pos.maxHeight - overflowBottom) };
      }
    }
    if (overflowRight > 0) {
      next = { ...(next || pos), left: Math.max(EDGE, pos.left - overflowRight) };
    }
    if (next) setPos(next);
  }, [open, pos]);

  // Move focus into the menu on open (keyboard users land on current value).
  // Runs after paint so the portal menu exists; re-runs once positioned.
  useEffect(() => {
    if (!open || !pos) return;
    const items = itemRefs.current.filter(Boolean);
    (items[focusIndex] || items[0])?.focus();
  }, [open, focusIndex, pos]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      const t = e.target;
      if (ref.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    }
    function handleKey(e) {
      if (e.key === 'Escape') close(true);
    }
    function handleScroll() {
      close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleScroll);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  function focusItem(i) {
    const items = itemRefs.current.filter(Boolean);
    if (!items.length) return;
    const n = (i + items.length) % items.length;
    setFocusIndex(n);
    items[n]?.focus();
  }

  function handleMenuKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(focusIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(focusIndex - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
    else if (e.key === 'End') { e.preventDefault(); focusItem(options.length - 1); }
    else if (e.key === 'Tab') { close(); }
  }

  async function handleChange(rawValue) {
    close();
    // Server expects null (not '') to clear the assignee
    const newValue = rawValue === '' && field === 'assigneeId' ? null : rawValue;
    if (newValue === value || (newValue === null && !value)) return;
    try {
      await updateFeedback.mutateAsync({ id: feedbackId, [field]: newValue });
      const labelName =
        field === 'assigneeId' ? 'Assignee' :
        field.charAt(0).toUpperCase() + field.slice(1);
      toastSuccess(`${labelName} updated`);
    } catch {
      const labelName =
        field === 'assigneeId' ? 'assignee' : field;
      toastError(`Failed to update ${labelName}`);
    }
  }

  function handleClick(e) {
    e.stopPropagation();
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  }

  return (
    <div ref={ref} className="relative inline-block" onMouseDown={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label || `Change ${field}`}
        className="cursor-pointer rounded transition-colors hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
      >
        {renderDisplay(value)}
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={label || field}
          onKeyDown={handleMenuKeyDown}
          className="z-[100] overflow-y-auto rounded-[3px] border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: MENU_WIDTH,
            maxHeight: pos.maxHeight,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleChange(opt.value); }}
              className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 dark:hover:bg-gray-700 dark:focus-visible:bg-gray-700 ${
                opt.value === value ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
