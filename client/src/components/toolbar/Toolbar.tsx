import React from 'react';
import { 
  FaMousePointer, 
  FaPencilAlt, 
  FaEraser, 
  FaFont, 
  FaSquare, 
  FaCircle, 
  FaStickyNote,
  FaUndo,
  FaRedo,
  FaDownload,
  FaMoon,
  FaSun,
  FaUsers,
  FaVideo,
  FaRobot,
} from 'react-icons/fa';
import { useWhiteboardStore } from '../../store/useWhiteboardStore';
import type { DrawingTool } from '../../types';
import './Toolbar.css';

interface ToolbarProps {
  onToggleAI?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onToggleAI }) => {
  const {
    selectedTool,
    setSelectedTool,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    isDarkMode,
    toggleDarkMode,
    users,
  } = useWhiteboardStore();

  const tools: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { tool: 'select', icon: <FaMousePointer />, label: 'Select' },
    { tool: 'pen', icon: <FaPencilAlt />, label: 'Pen' },
    { tool: 'eraser', icon: <FaEraser />, label: 'Eraser' },
    { tool: 'text', icon: <FaFont />, label: 'Text' },
    { tool: 'rectangle', icon: <FaSquare />, label: 'Rectangle' },
    { tool: 'circle', icon: <FaCircle />, label: 'Circle' },
    { tool: 'sticky', icon: <FaStickyNote />, label: 'Sticky Note' },
  ];

  return (
    <div className={`toolbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="toolbar-section">
        <div className="toolbar-title">Tools</div>
        <div className="tool-buttons">
          {tools.map(({ tool, icon, label }) => (
            <button
              key={tool}
              className={`tool-button ${selectedTool === tool ? 'active' : ''}`}
              onClick={() => setSelectedTool(tool)}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">Colors</div>
        <div className="color-pickers">
          <div className="color-input-group">
            <label htmlFor="stroke-color">Stroke</label>
            <input
              id="stroke-color"
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
            />
          </div>
          <div className="color-input-group">
            <label htmlFor="fill-color">Fill</label>
            <input
              id="fill-color"
              type="color"
              value={fillColor === 'transparent' ? '#ffffff' : fillColor}
              onChange={(e) => setFillColor(e.target.value)}
            />
            <button
              className="transparent-button"
              onClick={() => setFillColor('transparent')}
              title="Transparent fill"
            >
              ⊘
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">Stroke Width</div>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="stroke-width-slider"
        />
        <span className="stroke-width-value">{strokeWidth}px</span>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">Actions</div>
        <div className="action-buttons">
          <button className="action-button" title="Undo">
            <FaUndo />
          </button>
          <button className="action-button" title="Redo">
            <FaRedo />
          </button>
          <button className="action-button" title="Export">
            <FaDownload />
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">View</div>
        <button 
          className="action-button" 
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">Collaboration</div>
        <div className="collaboration-info">
          <div className="user-count">
            <FaUsers /> {users.length + 1}
          </div>
          <button className="action-button" title="Video call">
            <FaVideo />
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-title">AI Assistant</div>
        <button 
          className="action-button ai-button" 
          onClick={onToggleAI}
          title="Open AI Assistant"
        >
          <FaRobot /> AI Help
        </button>
      </div>
    </div>
  );
};
