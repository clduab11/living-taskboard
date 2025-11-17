import React from 'react';
import { FaTimes, FaKeyboard } from 'react-icons/fa';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  const shortcuts = [
    { category: 'Tools', items: [
      { keys: ['V'], description: 'Select tool' },
      { keys: ['P'], description: 'Pen tool' },
      { keys: ['E'], description: 'Eraser tool' },
      { keys: ['T'], description: 'Text tool' },
      { keys: ['R'], description: 'Rectangle tool' },
      { keys: ['C'], description: 'Circle tool' },
      { keys: ['S'], description: 'Sticky note' },
    ]},
    { category: 'View', items: [
      { keys: ['Ctrl/Cmd', 'D'], description: 'Toggle dark mode' },
      { keys: ['Space', 'Drag'], description: 'Pan canvas' },
      { keys: ['Ctrl/Cmd', 'Scroll'], description: 'Zoom in/out' },
    ]},
    { category: 'Editing', items: [
      { keys: ['Ctrl/Cmd', 'Z'], description: 'Undo (coming soon)' },
      { keys: ['Ctrl/Cmd', 'Shift', 'Z'], description: 'Redo (coming soon)' },
      { keys: ['Delete'], description: 'Delete selected' },
    ]},
  ];

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div className="keyboard-shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title">
            <FaKeyboard />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcuts.map((section) => (
            <div key={section.category} className="shortcuts-section">
              <h3>{section.category}</h3>
              <div className="shortcuts-list">
                {section.items.map((item, idx) => (
                  <div key={idx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {item.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd>{key}</kbd>
                          {keyIdx < item.keys.length - 1 && <span>+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="shortcut-description">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd>?</kbd> to show/hide this dialog</p>
        </div>
      </div>
    </div>
  );
};
