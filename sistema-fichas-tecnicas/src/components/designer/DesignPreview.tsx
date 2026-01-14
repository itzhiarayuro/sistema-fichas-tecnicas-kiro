'use client';

import { useState } from 'react';
import type { FichaDesign } from '@/types';

interface DesignPreviewProps {
  design: FichaDesign;
  isOpen: boolean;
  onClose: () => void;
}

export function DesignPreview({ design, isOpen, onClose }: DesignPreviewProps) {
  const [previewZoom, setPreviewZoom] = useState(1);

  if (!isOpen) return null;

  const pageWidth = design.pageConfig.width * 3.78;
  const pageHeight = design.pageConfig.height * 3.78;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Preview - {design.name}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm font-medium w-12 text-center">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                onClick={() => setPreviewZoom(Math.min(2, previewZoom + 0.1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center">
          <div
            className="bg-white shadow-lg"
            style={{
              width: pageWidth * previewZoom,
              height: pageHeight * previewZoom,
              position: 'relative',
            }}
          >
            {/* Figuras geométricas */}
            {design.shapes.map((shape) => (
              <ShapeRenderer key={shape.id} shape={shape} zoomLevel={previewZoom} />
            ))}

            {/* Campos */}
            {design.fieldPlacements.map((placement) => (
              <div
                key={placement.id}
                className="absolute border border-gray-300 bg-gray-50 flex items-center justify-center text-xs"
                style={{
                  left: placement.position.x * previewZoom,
                  top: placement.position.y * previewZoom,
                  width: placement.position.width * previewZoom,
                  height: placement.position.height * previewZoom,
                  fontSize: placement.style.fontSize * previewZoom,
                  fontFamily: placement.style.fontFamily,
                  color: placement.style.color,
                  backgroundColor: placement.style.backgroundColor,
                  borderRadius: placement.style.borderRadius,
                  padding: placement.style.padding * previewZoom,
                  zIndex: placement.zIndex,
                  opacity: placement.visible ? 1 : 0.5,
                }}
              >
                <span className="font-medium">{placement.customLabel || placement.fieldName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShapeRendererProps {
  shape: any;
  zoomLevel: number;
}

function ShapeRenderer({ shape, zoomLevel }: ShapeRendererProps) {
  const baseStyle = {
    position: 'absolute' as const,
    left: shape.position.x * zoomLevel,
    top: shape.position.y * zoomLevel,
    width: shape.position.width * zoomLevel,
    height: shape.position.height * zoomLevel,
    opacity: shape.style.opacity,
    zIndex: shape.zIndex,
  };

  if (shape.type === 'rectangle') {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: shape.style.fillColor,
          border: `${shape.style.strokeWidth}px solid ${shape.style.strokeColor}`,
          borderRadius: 0,
        }}
      />
    );
  }

  if (shape.type === 'circle') {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: shape.style.fillColor,
          border: `${shape.style.strokeWidth}px solid ${shape.style.strokeColor}`,
          borderRadius: '50%',
        }}
      />
    );
  }

  if (shape.type === 'line') {
    return (
      <svg
        style={{
          ...baseStyle,
          overflow: 'visible',
        }}
        width={shape.position.width * zoomLevel}
        height={shape.position.height * zoomLevel}
      >
        <line
          x1="0"
          y1="0"
          x2={shape.position.width * zoomLevel}
          y2={shape.position.height * zoomLevel}
          stroke={shape.style.strokeColor}
          strokeWidth={shape.style.strokeWidth}
          strokeDasharray={shape.style.strokeDasharray}
        />
      </svg>
    );
  }

  if (shape.type === 'triangle') {
    const w = shape.position.width * zoomLevel;
    const h = shape.position.height * zoomLevel;
    return (
      <svg
        style={{
          ...baseStyle,
          overflow: 'visible',
        }}
        width={w}
        height={h}
      >
        <polygon
          points={`${w / 2},0 ${w},${h} 0,${h}`}
          fill={shape.style.fillColor}
          stroke={shape.style.strokeColor}
          strokeWidth={shape.style.strokeWidth}
        />
      </svg>
    );
  }

  return null;
}
