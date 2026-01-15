'use client';

import { useState, useRef, useEffect } from 'react';
import { useDesignStore } from '@/stores';
import type { FichaDesign, FieldPlacement, FieldDictionaryEntry, GeometricShape } from '@/types';

interface DesignCanvasProps {
  design: FichaDesign;
  drawingTool: string | null;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export function DesignCanvas({ 
  design, 
  drawingTool,
  fillColor,
  strokeColor,
  strokeWidth,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Store
  const editorState = useDesignStore((state) => state.editorState);
  const updateEditorState = useDesignStore((state) => state.updateEditorState);
  const updateDesign = useDesignStore((state) => state.updateDesign);
  
  // Calcular dimensiones de la página en píxeles
  const pageWidth = design.pageConfig.width * 3.78;
  const pageHeight = design.pageConfig.height * 3.78;
  
  const zoomLevel = editorState?.zoomLevel || 1;
  const selectedFieldId = editorState?.selectedFieldId;
  
  // Undo/Redo
  const undo = useDesignStore((state) => state.undo);
  const redo = useDesignStore((state) => state.redo);
  const canUndo = useDesignStore((state) => state.canUndo);
  const canRedo = useDesignStore((state) => state.canRedo);
  
  // Manejar drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Manejar drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const fieldData = e.dataTransfer.getData('application/json');
      if (!fieldData) return;
      
      const field: FieldDictionaryEntry = JSON.parse(fieldData);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoomLevel;
      const y = (e.clientY - rect.top) / zoomLevel;
      
      const gridSize = design.pageConfig.gridSize;
      const snappedX = design.pageConfig.snapToGrid
        ? Math.round(x / gridSize) * gridSize
        : x;
      const snappedY = design.pageConfig.snapToGrid
        ? Math.round(y / gridSize) * gridSize
        : y;
      
      const newPlacement: FieldPlacement = {
        id: `placement-${Date.now()}`,
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.type,
        position: {
          x: snappedX,
          y: snappedY,
          width: 100,
          height: 30,
        },
        style: {
          fontSize: design.theme.baseFontSize,
          fontFamily: design.theme.fontFamily,
          color: design.theme.textColor,
          backgroundColor: 'transparent',
          borderRadius: 0,
          padding: 4,
        },
        isRepeatable: field.type === 'repeatable',
        zIndex: design.fieldPlacements.length,
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const updatedDesign: FichaDesign = {
        ...design,
        fieldPlacements: [...design.fieldPlacements, newPlacement],
        updatedAt: Date.now(),
      };
      
      updateDesign(design.id, updatedDesign);
      updateEditorState({ selectedFieldId: newPlacement.id });
    } catch (error) {
      console.error('Error dropping field:', error);
    }
  };
  
  // Manejar click en campo
  const handleFieldClick = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateEditorState({ selectedFieldId: fieldId });
  };
  
  // Manejar click en canvas
  const handleCanvasClick = () => {
    updateEditorState({ selectedFieldId: null });
  };
  
  // Manejar zoom
  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in'
      ? Math.min(zoomLevel + 0.1, 2)
      : Math.max(zoomLevel - 0.1, 0.5);
    updateEditorState({ zoomLevel: newZoom });
  };

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Manejar inserción de imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      // Crear nueva imagen en el centro del canvas
      const centerX = (design.pageConfig.width * 3.78) / 2 - 50;
      const centerY = (design.pageConfig.height * 3.78) / 2 - 50;

      const newImage = {
        id: `image-${Date.now()}`,
        src,
        fileName: file.name,
        position: {
          x: centerX,
          y: centerY,
          width: 100,
          height: 100,
        },
        style: {
          opacity: 1,
          rotation: 0,
        },
        zIndex: Math.max(...design.shapes.map(s => s.zIndex), ...design.fieldPlacements.map(f => f.zIndex), ...(design.images || []).map(i => i.zIndex), 0) + 1,
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedDesign = {
        ...design,
        images: [...(design.images || []), newImage],
        updatedAt: Date.now(),
      };

      updateDesign(design.id, updatedDesign);
      updateEditorState({ selectedFieldId: newImage.id });
    };

    reader.readAsDataURL(file);
    
    // Limpiar input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Manejar dibujo de figuras
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!drawingTool) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    setDrawStart({ x, y });
    setDrawEnd({ x, y });
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !drawStart || !drawingTool) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    setDrawEnd({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (!isDragging || !drawStart || !drawEnd || !drawingTool) {
      setIsDragging(false);
      return;
    }

    const width = Math.abs(drawEnd.x - drawStart.x);
    const height = Math.abs(drawEnd.y - drawStart.y);
    
    if (width < 5 || height < 5) {
      setIsDragging(false);
      return;
    }

    const newShape: GeometricShape = {
      id: `shape-${Date.now()}`,
      type: drawingTool as any,
      position: {
        x: Math.min(drawStart.x, drawEnd.x),
        y: Math.min(drawStart.y, drawEnd.y),
        width,
        height,
      },
      style: {
        fillColor,
        strokeColor,
        strokeWidth,
        opacity: 1,
      },
      zIndex: Math.max(...design.shapes.map(s => s.zIndex), ...design.fieldPlacements.map(f => f.zIndex), 0) + 1,
      locked: false,
      visible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedDesign: FichaDesign = {
      ...design,
      shapes: [...design.shapes, newShape],
      updatedAt: Date.now(),
    };

    updateDesign(design.id, updatedDesign);
    
    setIsDragging(false);
    setDrawStart(null);
    setDrawEnd(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Deshacer (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6-6m0 0l-6 6" />
            </svg>
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rehacer (Ctrl+Y)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m0 0l-6-6m6 6l6-6" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <span className="text-sm text-gray-600">Zoom:</span>
          <button
            onClick={() => handleZoom('out')}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {design.pageConfig.size} - {design.pageConfig.orientation}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-1 hover:bg-gray-100 rounded"
            title="Insertar imagen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={design.pageConfig.showGrid}
              onChange={(e) => {
                updateDesign(design.id, {
                  ...design,
                  pageConfig: {
                    ...design.pageConfig,
                    showGrid: e.target.checked,
                  },
                });
              }}
              className="rounded"
            />
            <span>Mostrar grilla</span>
          </label>
        </div>
      </div>
      
      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className={`relative bg-white shadow-lg transition-all ${drawingTool ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{
            width: pageWidth * zoomLevel,
            height: pageHeight * zoomLevel,
            backgroundImage: design.pageConfig.showGrid
              ? `linear-gradient(0deg, transparent calc(100% - 1px), #e5e7eb 100%),
                 linear-gradient(90deg, transparent calc(100% - 1px), #e5e7eb 100%)`
              : 'none',
            backgroundSize: design.pageConfig.showGrid
              ? `${design.pageConfig.gridSize * zoomLevel}px ${design.pageConfig.gridSize * zoomLevel}px`
              : 'auto',
          }}
        >
          {/* Márgenes visuales */}
          <div
            className="absolute border-2 border-dashed border-gray-300 pointer-events-none"
            style={{
              left: design.pageConfig.margins.left * zoomLevel,
              top: design.pageConfig.margins.top * zoomLevel,
              right: design.pageConfig.margins.right * zoomLevel,
              bottom: design.pageConfig.margins.bottom * zoomLevel,
              width: `calc(100% - ${(design.pageConfig.margins.left + design.pageConfig.margins.right) * zoomLevel}px)`,
              height: `calc(100% - ${(design.pageConfig.margins.top + design.pageConfig.margins.bottom) * zoomLevel}px)`,
            }}
          />
          
          {/* Figuras geométricas */}
          {design.shapes.map((shape) => (
            <CanvasShape
              key={shape.id}
              shape={shape}
              design={design}
              isSelected={shape.id === selectedFieldId}
              zoomLevel={zoomLevel}
              onSelect={(e) => handleFieldClick(shape.id, e)}
            />
          ))}
          
          {/* Imágenes */}
          {(design.images || []).map((image) => (
            <CanvasImage
              key={image.id}
              image={image}
              design={design}
              isSelected={image.id === selectedFieldId}
              zoomLevel={zoomLevel}
              onSelect={(e) => handleFieldClick(image.id, e)}
            />
          ))}
          
          {/* Campos colocados */}
          {design.fieldPlacements.map((placement) => (
            <CanvasField
              key={placement.id}
              placement={placement}
              isSelected={placement.id === selectedFieldId}
              zoomLevel={zoomLevel}
              onSelect={(e) => handleFieldClick(placement.id, e)}
            />
          ))}

          {/* Preview de dibujo en progreso */}
          {isDragging && drawStart && drawEnd && drawingTool && (
            <DrawingPreview
              start={drawStart}
              end={drawEnd}
              tool={drawingTool}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              zoomLevel={zoomLevel}
            />
          )}
          
          {/* Mensaje si no hay campos */}
          {design.fieldPlacements.length === 0 && design.shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              <p className="text-center">
                Arrastra campos desde el panel izquierdo<br />
                o usa las herramientas de dibujo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ShapeElementProps {
  shape: GeometricShape;
  zoomLevel: number;
}

function ShapeElement({ shape, zoomLevel }: ShapeElementProps) {
  if (shape.type === 'rectangle') {
    return (
      <div
        className="absolute border"
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: shape.position.width * zoomLevel,
          height: shape.position.height * zoomLevel,
          backgroundColor: shape.style.fillColor,
          borderColor: shape.style.strokeColor,
          borderWidth: shape.style.strokeWidth,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
      />
    );
  }

  if (shape.type === 'circle') {
    return (
      <div
        className="absolute border rounded-full"
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: shape.position.width * zoomLevel,
          height: shape.position.height * zoomLevel,
          backgroundColor: shape.style.fillColor,
          borderColor: shape.style.strokeColor,
          borderWidth: shape.style.strokeWidth,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
      />
    );
  }

  if (shape.type === 'line') {
    const angle = Math.atan2(shape.position.height, shape.position.width) * (180 / Math.PI);
    const length = Math.sqrt(
      shape.position.width ** 2 + shape.position.height ** 2
    );
    
    return (
      <div
        className="absolute"
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: length * zoomLevel,
          height: shape.style.strokeWidth,
          backgroundColor: shape.style.strokeColor,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 0',
        }}
      />
    );
  }

  if (shape.type === 'triangle') {
    const w = shape.position.width * zoomLevel;
    const h = shape.position.height * zoomLevel;
    
    return (
      <svg
        className="absolute"
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: w,
          height: h,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
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

interface CanvasImageProps {
  image: any; // DesignImage type
  design: FichaDesign;
  isSelected: boolean;
  zoomLevel: number;
  onSelect: (e: React.MouseEvent) => void;
}

function CanvasImage({ image, design, isSelected, zoomLevel, onSelect }: CanvasImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  
  const updateDesign = useDesignStore((state) => state.updateDesign);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    e.stopPropagation();
    onSelect(e);
    
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = imageRef.current?.parentElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const newX = (e.clientX - canvasRect.left - dragOffset.x) / zoomLevel;
      const newY = (e.clientY - canvasRect.top - dragOffset.y) / zoomLevel;
      
      const gridSize = design.pageConfig.gridSize;
      const finalX = design.pageConfig.snapToGrid
        ? Math.round(newX / gridSize) * gridSize
        : newX;
      const finalY = design.pageConfig.snapToGrid
        ? Math.round(newY / gridSize) * gridSize
        : newY;
      
      const updatedImages = (design.images || []).map((img) =>
        img.id === image.id
          ? {
              ...img,
              position: {
                ...img.position,
                x: Math.max(0, finalX),
                y: Math.max(0, finalY),
              },
              updatedAt: Date.now(),
            }
          : img
      );
      
      updateDesign(design.id, {
        images: updatedImages,
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoomLevel, image, design, updateDesign]);
  
  useEffect(() => {
    if (!isResizing) return;
    
    const startX = image.position.width;
    const startY = image.position.height;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (lastX === 0 && lastY === 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      
      const deltaX = (e.clientX - lastX) / zoomLevel;
      const deltaY = (e.clientY - lastY) / zoomLevel;
      
      const newWidth = Math.max(20, startX + deltaX);
      const newHeight = Math.max(20, startY + deltaY);
      
      const updatedImages = (design.images || []).map((img) =>
        img.id === image.id
          ? {
              ...img,
              position: {
                ...img.position,
                width: newWidth,
                height: newHeight,
              },
              updatedAt: Date.now(),
            }
          : img
      );
      
      updateDesign(design.id, {
        images: updatedImages,
      });
      
      lastX = e.clientX;
      lastY = e.clientY;
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, image, design, zoomLevel, updateDesign]);

  return (
    <div
      ref={imageRef}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
      className={`absolute cursor-grab active:cursor-grabbing transition-all select-none border-2 ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-400'
          : 'hover:ring-1 hover:ring-gray-400 hover:border-gray-400 border-gray-300'
      } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
      style={{
        left: image.position.x * zoomLevel,
        top: image.position.y * zoomLevel,
        width: image.position.width * zoomLevel,
        height: image.position.height * zoomLevel,
        zIndex: image.zIndex,
        opacity: image.style.opacity,
        transform: `rotate(${image.style.rotation}deg)`,
        overflow: 'hidden',
      }}
    >
      <img
        src={image.src}
        alt={image.fileName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          filter: image.style.filter || 'none',
        }}
      />
      
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl hover:bg-blue-600"
          title="Redimensionar"
        />
      )}
    </div>
  );
}

interface DrawingPreviewProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  tool: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  zoomLevel: number;
}

function DrawingPreview({
  start,
  end,
  tool,
  fillColor,
  strokeColor,
  strokeWidth,
  zoomLevel,
}: DrawingPreviewProps) {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);

  const baseStyle = {
    position: 'absolute' as const,
    left: x * zoomLevel,
    top: y * zoomLevel,
    width: width * zoomLevel,
    height: height * zoomLevel,
    opacity: 0.7,
    pointerEvents: 'none' as const,
  };

  if (tool === 'rectangle') {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
        }}
      />
    );
  }

  if (tool === 'circle') {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: '50%',
        }}
      />
    );
  }

  if (tool === 'line') {
    const angle = Math.atan2(height, width) * (180 / Math.PI);
    const length = Math.sqrt(width ** 2 + height ** 2);
    
    return (
      <div
        style={{
          ...baseStyle,
          width: length * zoomLevel,
          height: strokeWidth,
          backgroundColor: strokeColor,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 0',
        }}
      />
    );
  }

  if (tool === 'triangle') {
    return (
      <svg
        style={{
          ...baseStyle,
        }}
        width={width * zoomLevel}
        height={height * zoomLevel}
      >
        <polygon
          points={`${(width * zoomLevel) / 2},0 ${width * zoomLevel},${height * zoomLevel} 0,${height * zoomLevel}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  return null;
}

interface CanvasShapeProps {
  shape: GeometricShape;
  design: FichaDesign;
  isSelected: boolean;
  zoomLevel: number;
  onSelect: (e: React.MouseEvent) => void;
}

function CanvasShape({ shape, design, isSelected, zoomLevel, onSelect }: CanvasShapeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const shapeRef = useRef<HTMLDivElement>(null);
  
  const updateDesign = useDesignStore((state) => state.updateDesign);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    e.stopPropagation();
    onSelect(e);
    
    const rect = shapeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = shapeRef.current?.parentElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const newX = (e.clientX - canvasRect.left - dragOffset.x) / zoomLevel;
      const newY = (e.clientY - canvasRect.top - dragOffset.y) / zoomLevel;
      
      const gridSize = design.pageConfig.gridSize;
      const finalX = design.pageConfig.snapToGrid
        ? Math.round(newX / gridSize) * gridSize
        : newX;
      const finalY = design.pageConfig.snapToGrid
        ? Math.round(newY / gridSize) * gridSize
        : newY;
      
      const updatedShapes = design.shapes.map((s) =>
        s.id === shape.id
          ? {
              ...s,
              position: {
                ...s.position,
                x: Math.max(0, finalX),
                y: Math.max(0, finalY),
              },
              updatedAt: Date.now(),
            }
          : s
      );
      
      updateDesign(design.id, {
        shapes: updatedShapes,
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoomLevel, shape, design, updateDesign]);
  
  useEffect(() => {
    if (!isResizing) return;
    
    const startX = shape.position.width;
    const startY = shape.position.height;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (lastX === 0 && lastY === 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      
      const deltaX = (e.clientX - lastX) / zoomLevel;
      const deltaY = (e.clientY - lastY) / zoomLevel;
      
      const newWidth = Math.max(10, startX + deltaX);
      const newHeight = Math.max(10, startY + deltaY);
      
      const updatedShapes = design.shapes.map((s) =>
        s.id === shape.id
          ? {
              ...s,
              position: {
                ...s.position,
                width: newWidth,
                height: newHeight,
              },
              updatedAt: Date.now(),
            }
          : s
      );
      
      updateDesign(design.id, {
        shapes: updatedShapes,
      });
      
      lastX = e.clientX;
      lastY = e.clientY;
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, shape, design, zoomLevel, updateDesign]);

  // Renderizar según el tipo de figura
  if (shape.type === 'rectangle') {
    return (
      <div
        ref={shapeRef}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
        className={`absolute cursor-grab active:cursor-grabbing transition-all select-none border ${
          isSelected
            ? 'ring-2 ring-blue-500 border-blue-400'
            : 'hover:ring-1 hover:ring-gray-400 hover:border-gray-400'
        } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: shape.position.width * zoomLevel,
          height: shape.position.height * zoomLevel,
          backgroundColor: shape.style.fillColor,
          borderColor: shape.style.strokeColor,
          borderWidth: shape.style.strokeWidth,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
      >
        {isSelected && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl hover:bg-blue-600"
            title="Redimensionar"
          />
        )}
      </div>
    );
  }

  if (shape.type === 'circle') {
    return (
      <div
        ref={shapeRef}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
        className={`absolute cursor-grab active:cursor-grabbing transition-all select-none border rounded-full ${
          isSelected
            ? 'ring-2 ring-blue-500 border-blue-400'
            : 'hover:ring-1 hover:ring-gray-400 hover:border-gray-400'
        } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: shape.position.width * zoomLevel,
          height: shape.position.height * zoomLevel,
          backgroundColor: shape.style.fillColor,
          borderColor: shape.style.strokeColor,
          borderWidth: shape.style.strokeWidth,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
      >
        {isSelected && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl hover:bg-blue-600"
            title="Redimensionar"
          />
        )}
      </div>
    );
  }

  if (shape.type === 'line') {
    const angle = Math.atan2(shape.position.height, shape.position.width) * (180 / Math.PI);
    const length = Math.sqrt(
      shape.position.width ** 2 + shape.position.height ** 2
    );
    
    return (
      <div
        ref={shapeRef}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
        className={`absolute cursor-grab active:cursor-grabbing transition-all select-none ${
          isSelected
            ? 'ring-2 ring-blue-500'
            : 'hover:ring-1 hover:ring-gray-400'
        } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: length * zoomLevel,
          height: shape.style.strokeWidth,
          backgroundColor: shape.style.strokeColor,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 0',
        }}
      >
        {isSelected && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl hover:bg-blue-600"
            title="Redimensionar"
          />
        )}
      </div>
    );
  }

  if (shape.type === 'triangle') {
    const w = shape.position.width * zoomLevel;
    const h = shape.position.height * zoomLevel;
    
    return (
      <svg
        ref={shapeRef as any}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
        className={`absolute cursor-grab active:cursor-grabbing transition-all select-none ${
          isSelected
            ? 'ring-2 ring-blue-500'
            : 'hover:ring-1 hover:ring-gray-400'
        } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
        style={{
          left: shape.position.x * zoomLevel,
          top: shape.position.y * zoomLevel,
          width: w,
          height: h,
          opacity: shape.style.opacity,
          zIndex: shape.zIndex,
        }}
      >
        <polygon
          points={`${w / 2},0 ${w},${h} 0,${h}`}
          fill={shape.style.fillColor}
          stroke={shape.style.strokeColor}
          strokeWidth={shape.style.strokeWidth}
        />
        {isSelected && (
          <rect
            x={w - 8}
            y={h - 8}
            width="8"
            height="8"
            fill="#3b82f6"
            className="cursor-se-resize hover:fill-blue-600"
            onMouseDown={handleResizeMouseDown}
            title="Redimensionar"
          />
        )}
      </svg>
    );
  }

  return null;
}

interface CanvasFieldProps {
  placement: FieldPlacement;
  isSelected: boolean;
  zoomLevel: number;
  onSelect: (e: React.MouseEvent) => void;
}

function CanvasField({ placement, isSelected, zoomLevel, onSelect }: CanvasFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const updateDesign = useDesignStore((state) => state.updateDesign);
  const designs = useDesignStore((state) => state.designs);
  
  const currentDesign = Array.from(designs.values()).find(
    (d) => d.fieldPlacements && d.fieldPlacements.some((fp) => fp.id === placement.id)
  );
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    e.stopPropagation();
    onSelect(e);
    
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };
  
  useEffect(() => {
    if (!isDragging || !currentDesign) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = fieldRef.current?.parentElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const newX = (e.clientX - canvasRect.left - dragOffset.x) / zoomLevel;
      const newY = (e.clientY - canvasRect.top - dragOffset.y) / zoomLevel;
      
      const gridSize = currentDesign.pageConfig.gridSize;
      const finalX = currentDesign.pageConfig.snapToGrid
        ? Math.round(newX / gridSize) * gridSize
        : newX;
      const finalY = currentDesign.pageConfig.snapToGrid
        ? Math.round(newY / gridSize) * gridSize
        : newY;
      
      const updatedPlacements = currentDesign.fieldPlacements.map((fp) =>
        fp.id === placement.id
          ? {
              ...fp,
              position: {
                ...fp.position,
                x: Math.max(0, finalX),
                y: Math.max(0, finalY),
              },
              updatedAt: Date.now(),
            }
          : fp
      );
      
      updateDesign(currentDesign.id, {
        fieldPlacements: updatedPlacements,
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoomLevel, placement, currentDesign, updateDesign]);
  
  useEffect(() => {
    if (!isResizing || !currentDesign) return;
    
    const startX = placement.position.width;
    const startY = placement.position.height;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (lastX === 0 && lastY === 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      
      const deltaX = (e.clientX - lastX) / zoomLevel;
      const deltaY = (e.clientY - lastY) / zoomLevel;
      
      const newWidth = Math.max(30, startX + deltaX);
      const newHeight = Math.max(20, startY + deltaY);
      
      const updatedPlacements = currentDesign.fieldPlacements.map((fp) =>
        fp.id === placement.id
          ? {
              ...fp,
              position: {
                ...fp.position,
                width: newWidth,
                height: newHeight,
              },
              updatedAt: Date.now(),
            }
          : fp
      );
      
      updateDesign(currentDesign.id, {
        fieldPlacements: updatedPlacements,
      });
      
      lastX = e.clientX;
      lastY = e.clientY;
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, placement, currentDesign, zoomLevel, updateDesign]);

  return (
    <div
      ref={fieldRef}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
      className={`absolute cursor-grab active:cursor-grabbing transition-all select-none border border-gray-300 ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-400'
          : 'hover:ring-1 hover:ring-gray-400 hover:border-gray-400'
      } ${isDragging ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
      style={{
        left: placement.position.x * zoomLevel,
        top: placement.position.y * zoomLevel,
        width: placement.position.width * zoomLevel,
        height: placement.position.height * zoomLevel,
        fontSize: placement.style.fontSize * zoomLevel,
        fontFamily: placement.style.fontFamily,
        color: placement.style.color,
        backgroundColor: placement.style.backgroundColor,
        borderRadius: placement.style.borderRadius,
        padding: placement.style.padding * zoomLevel,
        zIndex: placement.zIndex,
        opacity: placement.visible ? 1 : 0.5,
      }}
    >
      <div className="text-xs font-medium truncate pointer-events-none">
        {placement.customLabel || placement.fieldName}
      </div>
      
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl hover:bg-blue-600"
          title="Redimensionar"
        />
      )}
    </div>
  );
}
