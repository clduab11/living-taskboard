import { useEffect, useCallback, useMemo } from 'react';
import { useCanvasStore } from '../store/canvasStore';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: string;
  action: () => void;
}

export const useKeyboardShortcuts = (boardId?: string) => {
  const { setActiveTool, setZoom, zoom, toggleGrid, toggleSnapToGrid } = useCanvasStore();

  // Memoize shortcuts array to prevent recreation on every render
  const shortcuts: ShortcutConfig[] = useMemo(() => [
    // Tool selection
    { key: 'v', description: 'Select tool', category: 'Tools', action: () => setActiveTool({ type: 'select' }) },
    { key: 'p', description: 'Pen tool', category: 'Tools', action: () => setActiveTool({ type: 'pen', color: '#000000', strokeWidth: 2 }) },
    { key: 'r', description: 'Rectangle tool', category: 'Tools', action: () => setActiveTool({ type: 'rectangle', color: '#4ECDC4' }) },
    { key: 'o', description: 'Circle tool', category: 'Tools', action: () => setActiveTool({ type: 'circle', color: '#FF6B6B' }) },
    { key: 't', description: 'Text tool', category: 'Tools', action: () => setActiveTool({ type: 'text' }) },
    { key: 'n', description: 'Sticky note', category: 'Tools', action: () => setActiveTool({ type: 'sticky' }) },

    // View
    { key: '=', ctrl: true, description: 'Zoom in', category: 'View', action: () => setZoom(zoom * 1.1) },
    { key: '-', ctrl: true, description: 'Zoom out', category: 'View', action: () => setZoom(zoom / 1.1) },
    { key: '0', ctrl: true, description: 'Reset zoom', category: 'View', action: () => setZoom(1) },
    { key: 'g', description: 'Toggle grid', category: 'View', action: () => toggleGrid() },
    { key: 'g', shift: true, description: 'Toggle snap to grid', category: 'View', action: () => toggleSnapToGrid() },

    // Edit
    { key: 'z', ctrl: true, description: 'Undo', category: 'Edit', action: () => console.log('Undo') },
    { key: 'z', ctrl: true, shift: true, description: 'Redo', category: 'Edit', action: () => console.log('Redo') },
    { key: 'a', ctrl: true, description: 'Select all', category: 'Edit', action: () => console.log('Select all') },
    { key: 'd', ctrl: true, description: 'Duplicate', category: 'Edit', action: () => console.log('Duplicate') },
    { key: 'Delete', description: 'Delete selected', category: 'Edit', action: () => console.log('Delete') },
    { key: 'Backspace', description: 'Delete selected', category: 'Edit', action: () => console.log('Delete') },
  ], [setActiveTool, setZoom, zoom, toggleGrid, toggleSnapToGrid]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      e.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    if (!boardId) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boardId, handleKeyDown]);

  return { shortcuts };
};

export const getShortcutDisplay = (shortcut: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }) => {
  const parts = [];
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');

  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  if (key === 'Delete' || key === 'Backspace') key = isMac ? '⌫' : 'Del';

  parts.push(key.toUpperCase());

  return parts.join(isMac ? '' : '+');
};
