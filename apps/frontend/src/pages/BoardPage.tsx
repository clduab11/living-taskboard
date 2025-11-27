import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '../components/Canvas';
import { Toolbar } from '../components/Toolbar';
import { boardAPI, aiAPI } from '../services/api';
import { wsService } from '../services/websocket';
import { useAuthStore } from '../store/authStore';
import { useCanvasStore } from '../store/canvasStore';
import { Board, AIGenerationType } from '@living-taskboard/shared';
import toast from 'react-hot-toast';
import { Sparkles, X } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<AIGenerationType>(AIGenerationType.MIND_MAP);
  const [aiLoading, setAiLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { objects, addObject } = useCanvasStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadBoard();
    wsService.connect();

    return () => {
      if (id) {
        wsService.leaveBoard(id);
      }
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (id && board) {
      wsService.joinBoard(id);
    }
  }, [id, board]);

  const loadBoard = async () => {
    if (!id) return;

    try {
      const response = await boardAPI.getById(id);
      setBoard(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load board');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);

    try {
      const context = aiType === AIGenerationType.AUTO_LAYOUT ||
                      aiType === AIGenerationType.MEETING_NOTES ||
                      aiType === AIGenerationType.SMART_SHAPES
        ? { objects }
        : undefined;

      const response = await aiAPI.generate(aiPrompt, aiType, context);

      if (aiType === AIGenerationType.MEETING_NOTES) {
        // Show meeting notes in a new modal or download
        const notes = response.data.data.notes;
        const blob = new Blob([notes], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meeting-notes.md';
        a.click();
        toast.success('Meeting notes generated!');
      } else {
        // Add generated objects to canvas
        const generatedObjects = response.data.data.objects || [];
        generatedObjects.forEach((obj: any) => {
          addObject({ ...obj, boardId: id });
        });
        toast.success('AI generation complete!');
      }

      setShowAIModal(false);
      setAiPrompt('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = () => {
    // Simple export implementation - in production, use backend endpoint
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${board?.name || 'board'}.png`;
      a.click();
      toast.success('Board exported!');
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Board link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!board || !id) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">{board.name}</h1>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onAIClick={() => setShowAIModal(true)}
        onExportClick={handleExport}
        onShareClick={handleShare}
      />

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <Canvas boardId={id} />
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={20} className="text-primary-600" />
                AI Assistant
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAIGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What would you like to create?
                </label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value as AIGenerationType)}
                  className="input w-full"
                >
                  <option value={AIGenerationType.MIND_MAP}>Mind Map</option>
                  <option value={AIGenerationType.FLOWCHART}>Flowchart</option>
                  <option value={AIGenerationType.DIAGRAM}>Diagram</option>
                  <option value={AIGenerationType.AUTO_LAYOUT}>Auto Layout (current objects)</option>
                  <option value={AIGenerationType.MEETING_NOTES}>Generate Meeting Notes</option>
                  <option value={AIGenerationType.SMART_SHAPES}>Suggest Connections</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your idea
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., 'Create a mind map for a new mobile app project' or 'Generate a flowchart for user authentication'"
                  className="input w-full h-32 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="spinner w-4 h-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500">
                Powered by Claude AI. Your prompts help create intelligent, context-aware diagrams.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
