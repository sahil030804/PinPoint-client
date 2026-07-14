'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-2 rounded-[3px] px-3 py-2 text-sm font-medium shadow-[0_4px_12px_rgba(9,30,66,0.25)] ${
              toast.type === 'success'
                ? 'bg-[#00875A] text-white'
                : toast.type === 'error'
                ? 'bg-[#DE350B] text-white'
                : toast.type === 'warning'
                ? 'bg-[#FF8B00] text-white'
                : 'bg-[#0052CC] text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle size={16} className="shrink-0" />
            ) : (
              <Info size={16} className="shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
              className="ml-2 rounded-sm p-0.5 opacity-70 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
