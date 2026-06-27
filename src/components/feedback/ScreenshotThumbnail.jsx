'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScreenshotLightbox } from './ScreenshotLightbox';

export function ScreenshotThumbnail({ screenshot, annotations, size = 'md' }) {
  const [open, setOpen] = useState(false);
  const url = typeof screenshot === 'string' ? screenshot : (screenshot?.clientUrl || screenshot?.serverUrl);
  if (!url) return null;

  const sizeMap = { sm: { w: 80, h: 56 }, md: { w: 120, h: 80 } };
  const { w, h } = sizeMap[size] || sizeMap.md;

  return (
    <>
      <div
        className="shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ width: w, height: h, position: 'relative' }}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <img src={url} alt="Feedback screenshot" className="h-full w-full object-cover" />
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
