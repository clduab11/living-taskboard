import React from 'react';
import {
  MousePointer2,
  Pen,
  Square,
  Circle,
  Type,
  StickyNote,
  ZoomIn,
  ZoomOut,
  Grid,
  Undo,
  Redo,
  Download,
  Users,
  Sparkles,
} from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

interface ToolbarProps {
  onAIClick: () => void;
  onExportClick: () => void;
  onShareClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAIClick, onExportClick, onShareClick }) => {
  const { activeTool, setActiveTool, zoom, setZoom, gridEnabled, toggleGrid } = useCanvasStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#4ECDC4');

  const tools = [
    { type: 'select' as const, icon: MousePointer2, label: 'Select' },
    { type: 'pen' as const, icon: Pen, label: 'Pen' },
    { type: 'rectangle' as const, icon: Square, label: 'Rectangle' },
    { type: 'circle' as const, icon: Circle, label: 'Circle' },
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'sticky' as const, icon: StickyNote, label: 'Sticky Note' },
  ];

  const handleToolChange = (type: typeof activeTool.type) => {
    setActiveTool({
      type,
      color: currentColor,
      strokeWidth: 2,
    });
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (activeTool.type !== 'select') {
      setActiveTool({ ...activeTool, color });
    }
  };

  return (
    <div className="toolbar">
      {/* Drawing tools */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        {tools.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            className={`toolbar-button ${activeTool.type === type ? 'active' : ''}`}
            onClick={() => handleToolChange(type)}
            title={label}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>

      {/* Color picker */}
      <div className="relative">
        <button
          className="toolbar-button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Color"
        >
          <div
            className="w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
        </button>
        {showColorPicker && (
          <div className="absolute top-full mt-2 z-50 bg-white p-2 rounded-lg shadow-lg">
            <HexColorPicker color={currentColor} onChange={handleColorChange} />
            <button
              className="mt-2 w-full btn-secondary text-sm"
              onClick={() => setShowColorPicker(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
        <button
          className="toolbar-button"
          onClick={() => setZoom(zoom - 0.1)}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <span className="text-sm px-2 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="toolbar-button"
          onClick={() => setZoom(zoom + 0.1)}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => setZoom(1)}
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>

      {/* Grid toggle */}
      <div className="border-l border-gray-300 pl-2 ml-2">
        <button
          className={`toolbar-button ${gridEnabled ? 'active' : ''}`}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
      </div>

      {/* AI Features */}
      <div className="border-l border-gray-300 pl-2 ml-2">
        <button
          className="toolbar-button flex items-center gap-2"
          onClick={onAIClick}
          title="AI Assistant"
        >
          <Sparkles size={20} />
          <span className="text-sm font-medium">AI</span>
        </button>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          className="toolbar-button"
          onClick={onShareClick}
          title="Share Board"
        >
          <Users size={20} />
        </button>
        <button
          className="toolbar-button"
          onClick={onExportClick}
          title="Export"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};
