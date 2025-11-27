import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { getShortcutDisplay } from '../hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const allShortcuts = [
  // Tools
  { key: 'v', description: 'Select tool', category: 'Tools' },
  { key: 'p', description: 'Pen tool', category: 'Tools' },
  { key: 'r', description: 'Rectangle tool', category: 'Tools' },
  { key: 'o', description: 'Circle tool', category: 'Tools' },
  { key: 't', description: 'Text tool', category: 'Tools' },
  { key: 'n', description: 'Sticky note', category: 'Tools' },
  { key: 'e', description: 'Eraser tool', category: 'Tools' },

  // View
  { key: '=', ctrl: true, description: 'Zoom in', category: 'View' },
  { key: '-', ctrl: true, description: 'Zoom out', category: 'View' },
  { key: '0', ctrl: true, description: 'Reset zoom (100%)', category: 'View' },
  { key: 'g', description: 'Toggle grid', category: 'View' },
  { key: 'g', shift: true, description: 'Toggle snap to grid', category: 'View' },
  { key: ' ', description: 'Pan canvas (hold)', category: 'View' },

  // Edit
  { key: 'z', ctrl: true, description: 'Undo', category: 'Edit' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo', category: 'Edit' },
  { key: 'y', ctrl: true, description: 'Redo (alternate)', category: 'Edit' },
  { key: 'a', ctrl: true, description: 'Select all', category: 'Edit' },
  { key: 'd', ctrl: true, description: 'Duplicate selection', category: 'Edit' },
  { key: 'c', ctrl: true, description: 'Copy', category: 'Edit' },
  { key: 'x', ctrl: true, description: 'Cut', category: 'Edit' },
  { key: 'v', ctrl: true, description: 'Paste', category: 'Edit' },
  { key: 'Delete', description: 'Delete selection', category: 'Edit' },

  // Object
  { key: '[', ctrl: true, description: 'Send backward', category: 'Object' },
  { key: ']', ctrl: true, description: 'Bring forward', category: 'Object' },
  { key: '[', ctrl: true, shift: true, description: 'Send to back', category: 'Object' },
  { key: ']', ctrl: true, shift: true, description: 'Bring to front', category: 'Object' },
  { key: 'g', ctrl: true, description: 'Group selection', category: 'Object' },
  { key: 'g', ctrl: true, shift: true, description: 'Ungroup', category: 'Object' },
  { key: 'l', ctrl: true, description: 'Lock/unlock', category: 'Object' },

  // File
  { key: 's', ctrl: true, description: 'Save (auto-saved)', category: 'File' },
  { key: 'e', ctrl: true, description: 'Export', category: 'File' },
  { key: '/', ctrl: true, description: 'Show shortcuts', category: 'File' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredShortcuts = allShortcuts.filter(
    s => s.description.toLowerCase().includes(search.toLowerCase()) ||
         s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filteredShortcuts.map(s => s.category))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {filteredShortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                        {getShortcutDisplay(shortcut)}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No shortcuts found for "{search}"
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">/</kbd> to toggle this menu
          </p>
        </div>
      </div>
    </div>
  );
};
