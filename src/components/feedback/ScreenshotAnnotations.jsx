'use client';

import { useState } from 'react';

export function ScreenshotAnnotations({ annotations, width, height, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!annotations?.length) return null;

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ overflow: 'visible' }}
    >
      {annotations.map((a, index) => {
        const rx = a.x * width;
        const ry = a.y * height;
        const rw = Math.max(3, a.width * width);
        const rh = Math.max(3, a.height * height);
        const isHovered = hoveredId === a.id;
        const isSelected = selectedId === a.id;

        const tipW = 240;
        const tipH = 80;
        const tipX = Math.min(rx + rw + 12, Math.max(0, width - tipW - 4));
        let tipY = ry - tipH - 8;
        if (tipY < 4) tipY = ry + rh + 8;
        if (tipY + tipH > height + 4) tipY = Math.max(4, ry - tipH / 2);

        return (
          <g key={a.id}>
            <rect
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill={a.color}
              fillOpacity={isHovered || isSelected ? 0.3 : 0.15}
              stroke={a.color}
              strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
              strokeOpacity={0.9}
              rx={4}
              className="transition-all duration-150"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId(a.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect?.(selectedId === a.id ? null : a.id)}
            />

            <g
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId(a.id)}
              onClick={() => onSelect?.(selectedId === a.id ? null : a.id)}
            >
              <circle cx={rx + 10} cy={ry + 10} r={10} fill={a.color} stroke="#fff" strokeWidth={2} />
              <text
                x={rx + 10}
                y={ry + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={11}
                fontWeight={700}
                style={{ pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}
              >
                {index + 1}
              </text>
            </g>

            {(isHovered || isSelected) && a.label && (
              <foreignObject x={tipX} y={tipY} width={tipW} height={tipH}>
                <div
                  style={{
                    background: 'rgba(17, 24, 39, 0.92)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    fontFamily: 'system-ui, sans-serif',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    minHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                  }}
                >
                  {a.label}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}
