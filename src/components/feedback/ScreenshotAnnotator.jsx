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
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const imageWrapRef = useRef(null);
  const prevMouseRef = useRef(null);
  const drawingRef = useRef(null);

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

    const clicked = annotations.find((a) =>
      frac.x >= a.x && frac.x <= a.x + a.width &&
      frac.y >= a.y && frac.y <= a.y + a.height,
    );
    if (clicked) {
      setAnnotations((prev) => prev.filter((a) => a.id !== clicked.id));
      return;
    }

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
      setAnnotations((prev) => [
        ...prev,
        { id: generateId(), x, y, width: w, height: h, color: selectedColor, label: '' },
      ]);
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
        <h2 className="text-lg font-semibold text-white">Annotate Screenshot</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-[3px] border border-white/20 px-4 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(annotations)}
            className="rounded-[3px] bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
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
          />
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
