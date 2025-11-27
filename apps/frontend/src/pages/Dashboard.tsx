import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Board, BoardVisibility } from '@living-taskboard/shared';
import { Plus, LogOut, Settings, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const response = await boardAPI.getAll();
      setBoards(response.data.data);
    } catch (error) {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await boardAPI.create({
        name: newBoardName,
        visibility: BoardVisibility.PRIVATE,
      });

      const newBoard = response.data.data;
      setBoards([newBoard, ...boards]);
      setShowCreateModal(false);
      setNewBoardName('');
      toast.success('Board created!');

      navigate(`/board/${newBoard.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create board');
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Living Taskboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="toolbar-button" title="Settings">
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="toolbar-button"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Boards
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Board
          </button>
        </div>

        {/* Boards grid */}
        {boards.length === 0 ? (
          <div className="text-center py-12">
            <Folder size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No boards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first board to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map(board => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="card cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {board.description}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {board.visibility}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(board.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create board modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Board</h3>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="input w-full mb-4"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardName('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
