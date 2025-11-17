import { useEffect } from 'react';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import type { DrawingTool } from '../types';

export const useKeyboardShortcuts = () => {
  const { setSelectedTool, toggleDarkMode } = useWhiteboardStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Tool shortcuts
      const toolMap: Record<string, DrawingTool> = {
        'v': 'select',
        'p': 'pen',
        'e': 'eraser',
        't': 'text',
        'r': 'rectangle',
        'c': 'circle',
        's': 'sticky',
      };

      const key = e.key.toLowerCase();

      // Check for tool shortcuts
      if (toolMap[key] && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSelectedTool(toolMap[key]);
        return;
      }

      // Dark mode toggle (Ctrl/Cmd + D)
      if ((e.ctrlKey || e.metaKey) && key === 'd') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // TODO: Implement undo/redo
      // if ((e.ctrlKey || e.metaKey) && key === 'z') {
      //   if (e.shiftKey) {
      //     // Redo
      //   } else {
      //     // Undo
      //   }
      // }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSelectedTool, toggleDarkMode]);
};
