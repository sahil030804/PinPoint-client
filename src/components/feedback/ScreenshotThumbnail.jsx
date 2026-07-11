'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import ScreenshotLightbox from './ScreenshotLightbox';

export function ScreenshotThumbnail({ screenshot, annotations, size = 'md' }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const url = typeof screenshot === 'string' ? screenshot : (screenshot?.clientUrl || screenshot?.serverUrl);
  if (!url) return null;

  const sizeMap = { sm: { w: 80, h: 56 }, md: { w: 120, h: 80 } };
  const { w, h } = sizeMap[size] || sizeMap.md;

  return (
    <>
      <div
        className="shrink-0 cursor-pointer overflow-hidden rounded-[3px] border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        style={{ width: w, height: h, position: 'relative' }}
        onClick={(e) => { e.stopPropagation(); !error && setOpen(true); }}
      >
        {error ? (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ImageIcon size={20} />
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
            )}
            <img
              src={url}
              alt="Feedback screenshot"
              className={`h-full w-full object-cover ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          </>
        )}
        {annotations?.length > 0 && (
          <div className="absolute bottom-1 right-1 flex gap-0.5">
            {annotations.map((a) => (
              <span
                key={a.id}
                className="block h-2 w-2 rounded-full border border-white"
                style={{ backgroundColor: a.color }}
              />
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <ScreenshotLightbox url={url} annotations={annotations} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
