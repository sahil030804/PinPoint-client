'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScreenshotAnnotations } from './ScreenshotAnnotations';

const COLORS = ['#FF4444', '#FF8800', '#FFCC00', '#44BB44', '#4488FF', '#AA44FF'];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function ScreenshotAnnotator({ url, initialAnnotations = [], onSave, onClose }) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [mode, setMode] = useState('draw');
  const [drawing, setDrawing] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [editorId, setEditorId] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const imageWrapRef = useRef(null);
  const prevMouseRef = useRef(null);
  const drawingRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        // Close the note editor first, the annotator itself only when no editor is open.
        if (editorId) {
          setEditorId(null);
          setSelectedId(null);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, editorId]);

  // Persist the open editor's text into its annotation (used when switching
  // to another box or starting a new drawing, so typed text is never lost).
  function commitDraft() {
    if (!editorId) return;
    const text = labelDraft.trim();
    setAnnotations((prev) => prev.map((a) => (a.id === editorId ? { ...a, label: text } : a)));
  }

  function openEditor(id) {
    commitDraft();
    const ann = annotations.find((a) => a.id === id);
    setSelectedId(id);
    setLabelDraft(ann?.label || '');
    setEditorId(id);
  }

  function saveLabel() {
    commitDraft();
    setEditorId(null);
  }

  function deleteAnnotation(id) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (editorId === id) setEditorId(null);
    setSelectedId((prev) => (prev === id ? null : prev));
  }

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    }
  }, []);

  function handleImgLoad() {
    const img = imgRef.current;
    if (img && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }

  const fitScale = naturalSize && containerSize.w
    ? Math.min(
        (containerSize.w * 0.85) / naturalSize.w,
        (containerSize.h * 0.75) / naturalSize.h,
        1,
      )
    : 1;

  const pixelPerfectZoom = fitScale > 0 ? Math.max(1, 1 / fitScale) : 1;
  const maxZoom = Math.max(pixelPerfectZoom, 5);

  const displayW = naturalSize ? Math.round(naturalSize.w * fitScale * zoom) : null;
  const displayH = naturalSize ? Math.round(naturalSize.h * fitScale * zoom) : null;
  const isZoomed = zoom > 1;
  const zoomPercent = Math.round(fitScale * zoom * 100);

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

  function getFraction(clientX, clientY) {
    if (!imageWrapRef.current || !displayW || !displayH) return null;
    const rect = imageWrapRef.current.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  function handleMouseDown(e) {
    if (mode === 'pan') {
      setIsPanning(true);
      setPanOrigin({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
      return;
    }

    const frac = getFraction(e.clientX, e.clientY);
    if (!frac) return;

    // Clicking an existing box selects it and opens the note editor
    // (deletion is an explicit action inside the editor).
    const clicked = annotations.find((a) =>
      frac.x >= a.x && frac.x <= a.x + a.width &&
      frac.y >= a.y && frac.y <= a.y + a.height,
    );
    if (clicked) {
      openEditor(clicked.id);
      return;
    }

    // Starting a fresh drawing commits any open note first.
    commitDraft();
    setEditorId(null);

    const newDrawing = { startX: frac.x, startY: frac.y, currentX: frac.x, currentY: frac.y };
    drawingRef.current = newDrawing;
    setDrawing(newDrawing);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e) {
    if (isPanning) {
      setPosition({ x: e.clientX - panOrigin.x, y: e.clientY - panOrigin.y });
      return;
    }

    if (!drawingRef.current) return;
    const frac = getFraction(e.clientX, e.clientY);
    if (!frac) return;
    drawingRef.current = { ...drawingRef.current, currentX: frac.x, currentY: frac.y };
    setDrawing(drawingRef.current);
  }

  function handleMouseUp() {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!drawingRef.current) return;
    const d = drawingRef.current;
    const x = Math.min(d.startX, d.currentX);
    const y = Math.min(d.startY, d.currentY);
    const w = Math.abs(d.currentX - d.startX);
    const h = Math.abs(d.currentY - d.startY);
    if (w > 0.005 && h > 0.005) {
      const id = generateId();
      setAnnotations((prev) => [
        ...prev,
        { id, x, y, width: w, height: h, color: selectedColor, label: '' },
      ]);
      // Open the note editor straight away so the new box gets its text.
      setSelectedId(id);
      setLabelDraft('');
      setEditorId(id);
    }
    drawingRef.current = null;
    setDrawing(null);
  }

  const drawingRect = drawing
    ? {
        x: Math.min(drawing.startX, drawing.currentX),
        y: Math.min(drawing.startY, drawing.currentY),
        width: Math.abs(drawing.currentX - drawing.startX),
        height: Math.abs(drawing.currentY - drawing.startY),
        color: selectedColor,
      }
    : null;

  const cursor = mode === 'pan'
    ? (isPanning ? 'grabbing' : 'grab')
    : 'crosshair';

  const isAtDefault = zoom === 1 && position.x === 0 && position.y === 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-black/80 select-none"
      onWheel={handleWheel}
    >
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Annotate Screenshot</h2>
          <p className="mt-0.5 text-xs text-white/60">Draw a box to add a note · Click a box to edit its note</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(annotations)}
            className="rounded-lg bg-primary hover:bg-primary/90"
          >
            Save Annotations
          </button>
        </div>
      </div>

      <div
        className="flex h-full w-full items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={imageWrapRef}
          style={{
            position: 'relative',
            width: displayW || 'auto',
            height: displayH || 'auto',
            cursor,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isPanning || drawing ? 'none' : 'transform 0.15s ease',
          }}
        >
          <img
            ref={imgRef}
            src={url}
            alt="Annotate screenshot"
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
            onSelect={(id) => { if (id) openEditor(id); }}
          />
          {(() => {
            const editorAnn = editorId ? annotations.find((a) => a.id === editorId) : null;
            if (!editorAnn || !displayW || !displayH) return null;
            const ED_W = 248;
            const bx = editorAnn.x * displayW;
            const by = editorAnn.y * displayH;
            const bh = Math.max(2, editorAnn.height * displayH);
            const edX = Math.min(Math.max(bx, 8), Math.max(8, displayW - ED_W - 8));
            const below = by + bh + 8;
            const edY = below + 160 <= displayH ? below : Math.max(8, by - 168);
            const num = annotations.findIndex((a) => a.id === editorId) + 1;
            return (
              <div
                className="absolute z-10"
                style={{ left: edX, top: edY, width: ED_W, maxWidth: 'calc(100% - 16px)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <form
                  onSubmit={(e) => { e.preventDefault(); saveLabel(); }}
                  className="rounded-xl border border-white/10 bg-gray-900/95 p-3 shadow-2xl backdrop-blur"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: editorAnn.color }}
                    >
                      {num}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {editorAnn.label ? 'Edit note' : 'Add a note'}
                    </span>
                  </div>
                  <input
                    key={editorId}
                    autoFocus
                    value={labelDraft}
                    onChange={(e) => setLabelDraft(e.target.value)}
                    placeholder="Describe the issue…"
                    maxLength={280}
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
                  />
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 active:scale-95"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAnnotation(editorId)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-white/10 active:scale-95"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditorId(null); setSelectedId(null); }}
                      className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
          {drawingRect && (
            <svg
              width={displayW || 0}
              height={displayH || 0}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              <rect
                x={drawingRect.x * displayW}
                y={drawingRect.y * displayH}
                width={Math.max(2, drawingRect.width * displayW)}
                height={Math.max(2, drawingRect.height * displayH)}
                fill={drawingRect.color}
                fillOpacity={0.2}
                stroke={drawingRect.color}
                strokeWidth={2}
                strokeDasharray="6 3"
                rx={4}
              />
            </svg>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
        <button
          onClick={() => setMode('draw')}
          className={`flex items-center gap-1 rounded-full px-3 py-1 transition-colors active:scale-95 ${
            mode === 'draw' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Draw
        </button>
        <button
          onClick={() => setMode('pan')}
          className={`flex items-center gap-1 rounded-full px-3 py-1 transition-colors active:scale-95 ${
            mode === 'pan' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><circle cx="12" cy="12" r="1"/></svg>
          Pan
        </button>

        <span className="mx-1 text-gray-500">|</span>

        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`h-6 w-6 rounded-full border-2 transition-all ${
              selectedColor === color ? 'scale-110 border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}

        {annotations.length > 0 && (
          <>
            <span className="mx-1 text-gray-500">|</span>
          <button
            onClick={() => setAnnotations([])}
            className="text-white/70 hover:text-white active:scale-95 transition-transform"
          >
            Clear All
          </button>
            <span className="text-xs text-white/50">{annotations.length}</span>
          </>
        )}

        <span className="mx-1 text-gray-500">|</span>

        <button
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30"
          onClick={() => adjustZoom(-0.5)}
          disabled={zoom <= 1}
        >
          −
        </button>
        <span className="min-w-[4rem] text-center font-mono tabular-nums">{zoomPercent}%</span>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30 active:scale-90"
          onClick={() => adjustZoom(0.5)}
          disabled={zoom >= maxZoom}
        >
          +
        </button>
        <button
          className="hover:text-gray-300 disabled:opacity-30 active:scale-90 transition-transform"
          onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
          disabled={isAtDefault}
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
}

export default ScreenshotAnnotator;
