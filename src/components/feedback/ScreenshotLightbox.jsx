'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScreenshotAnnotations } from './ScreenshotAnnotations';

function ScreenshotLightbox({ url, annotations, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [annotations?.length]);

  useEffect(() => {
    if (selectedId && listRef.current) {
      const el = listRef.current.querySelector(`[data-ann-id="${selectedId}"]`);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);

  function handleImgLoad() {
    const img = imgRef.current;
    if (img && img.naturalWidth) {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }

  const fitScale = natural && containerSize.w
    ? Math.min(
        (containerSize.w * 0.9) / natural.w,
        (containerSize.h * 0.9) / natural.h,
        1,
      )
    : 1;

  const hasPanel = annotations?.length > 0;
  const displayFit = fitScale;
  const pixelPerfectZoom = displayFit > 0 ? Math.max(1, 1 / displayFit) : 1;
  const maxZoom = Math.max(pixelPerfectZoom, 5);
  const displayW = natural ? Math.round(natural.w * displayFit * zoom) : null;
  const displayH = natural ? Math.round(natural.h * displayFit * zoom) : null;
  const isZoomed = zoom > 1;
  const zoomPercent = Math.round(displayFit * zoom * 100);

  function adjustZoom(delta) {
    setZoom((z) => {
      const raw = Math.max(1, Math.min(maxZoom, z + delta));
      return Math.round(raw * 10) / 10;
    });
  }

  function handleWheel(e) {
    e.preventDefault();
    adjustZoom(e.deltaY > 0 ? -0.5 : 0.5);
  }

  function handleMouseDown(e) {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - position.x, y: e.clientY - position.y });
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y });
  }

  function endDrag() {
    setIsDragging(false);
  }

  function handleDoubleClick() {
    if (isZoomed) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(Math.min(pixelPerfectZoom, 2));
    }
  }

  const isAtDefault = zoom === 1 && position.x === 0 && position.y === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex flex-col md:flex-row overflow-hidden bg-black/90 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      {/* Image viewport — takes remaining space beside panel, so panel can never overlap SS */}
      <div
        ref={containerRef}
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <button
          onClick={onClose}
          aria-label="Close screenshot viewer"
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white backdrop-blur-sm hover:bg-black/80"
        >
          ✕
        </button>

        <div
          className="flex items-start justify-center"
          style={{
            cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <div style={{
            position: 'relative',
            width: displayW || 'auto',
            height: displayH || 'auto',
          }}>
            <img
              ref={imgRef}
              src={url}
              alt="Full-size screenshot"
              onLoad={handleImgLoad}
              draggable={false}
              style={{
                width: displayW ? `${displayW}px` : 'auto',
                height: displayH ? `${displayH}px` : 'auto',
                maxWidth: 'none',
                maxHeight: 'none',
                display: 'block',
              }}
            />
            <ScreenshotAnnotations
              annotations={annotations}
              width={displayW || 0}
              height={displayH || 0}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30"
            onClick={() => adjustZoom(-0.5)}
            disabled={zoom <= 1}
          >
            −
          </button>
          <span className="min-w-[4rem] text-center font-mono tabular-nums">{zoomPercent}%</span>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30"
            onClick={() => adjustZoom(0.5)}
            disabled={zoom >= maxZoom}
          >
            +
          </button>
          <span className="mx-1 text-gray-500">|</span>
          <button
            className="hover:text-gray-300 disabled:opacity-30"
            onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
            disabled={isAtDefault}
          >
            Reset
          </button>
        </div>
      </div>

      {hasPanel && (
        <div className="flex h-[38%] w-full shrink-0 flex-col overflow-hidden border-t border-white/10 bg-gray-900 md:h-full md:w-80 md:border-l md:border-t-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Annotations</h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">
              {annotations.length}
            </span>
          </div>
          <div ref={listRef} className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
            {annotations.map((a, index) => (
              <button
                key={a.id}
                data-ann-id={a.id}
                onClick={() => setSelectedId(selectedId === a.id ? null : a.id)}
                className={`w-full flex items-start gap-3 rounded-[3px] px-3 py-2.5 text-left text-sm transition-all ${
                  selectedId === a.id ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/5'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: a.color }}
                >
                  {index + 1}
                </span>
                <span className="text-white/90 leading-snug pt-0.5">
                  {a.label || <span className="text-white/40 italic">No description</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ScreenshotLightbox;
