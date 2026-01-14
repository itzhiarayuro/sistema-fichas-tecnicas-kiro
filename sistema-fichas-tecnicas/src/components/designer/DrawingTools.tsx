'use client';

import { useState } from 'react';

interface DrawingToolsProps {
  activeTool: string | null;
  onToolSelect: (tool: string | null) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export function DrawingTools({
  activeTool,
  onToolSelect,
  fillColor,
  onFillColorChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
}: DrawingToolsProps) {
  const [showColorPicker, setShowColorPicker] = useState<'fill' | 'stroke' | null>(null);

  const tools = [
    { id: 'rectangle', label: 'Rectángulo', icon: '▭' },
    { id: 'circle', label: 'Círculo', icon: '●' },
    { id: 'line', label: 'Línea', icon: '─' },
    { id: 'triangle', label: 'Triángulo', icon: '▲' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-6">
        {/* Herramientas de dibujo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Figuras:</span>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
              className={`px-3 py-2 rounded border transition-all ${
                activeTool === tool.id
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
            </button>
          ))}
        </div>

        {/* Separador */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Color de relleno */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Relleno:</span>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === 'fill' ? null : 'fill')}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-all"
              style={{ backgroundColor: fillColor }}
              title="Color de relleno"
            />
            {showColorPicker === 'fill' && (
              <div className="absolute top-10 left-0 z-10 bg-white border border-gray-300 rounded shadow-lg p-2">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => {
                    onFillColorChange(e.target.value);
                    setShowColorPicker(null);
                  }}
                  className="w-12 h-12 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Color de borde */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Borde:</span>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? null : 'stroke')}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-all"
              style={{ backgroundColor: strokeColor }}
              title="Color de borde"
            />
            {showColorPicker === 'stroke' && (
              <div className="absolute top-10 left-0 z-10 bg-white border border-gray-300 rounded shadow-lg p-2">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    onStrokeColorChange(e.target.value);
                    setShowColorPicker(null);
                  }}
                  className="w-12 h-12 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ancho de borde */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ancho:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 w-8">{strokeWidth}px</span>
        </div>
      </div>
    </div>
  );
}
