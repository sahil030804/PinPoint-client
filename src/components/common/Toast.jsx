'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
            onClick={() => removeToast(toast.id)}
            className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-emerald-600/90'
                : 'bg-red-600/90'
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
