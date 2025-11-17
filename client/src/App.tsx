import { useEffect, useState } from 'react';
import { WhiteboardCanvas } from './components/canvas/WhiteboardCanvas';
import { Toolbar } from './components/toolbar/Toolbar';
import { TemplateLibrary } from './components/templates/TemplateLibrary';
import { collaborationService } from './services/collaborationService';
import { useWhiteboardStore } from './store/useWhiteboardStore';
import type { Template } from './types';
import './App.css';

function App() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  
  const { 
    setCurrentUser, 
    setUsers, 
    addUser, 
    removeUser, 
    updateUserCursor,
    isDarkMode 
  } = useWhiteboardStore();

  useEffect(() => {
    // Get or create room ID from URL
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');
    
    if (urlRoomId) {
      setRoomId(urlRoomId);
    } else {
      // Generate new room ID
      const newRoomId = Math.random().toString(36).substring(7);
      setRoomId(newRoomId);
      window.history.replaceState({}, '', `?room=${newRoomId}`);
    }
  }, []);

  const handleJoinRoom = () => {
    if (!roomId) return;

    // Generate random user
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const user = {
      id: '',
      name: `User${Math.floor(Math.random() * 1000)}`,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setCurrentUser(user);

    // Connect to collaboration service
    collaborationService.connect();
    collaborationService.joinRoom(roomId, user);

    // Setup event listeners
    collaborationService.onUserJoined((newUser) => {
      console.log('User joined:', newUser);
      addUser(newUser);
    });

    collaborationService.onUserLeft((userId) => {
      console.log('User left:', userId);
      removeUser(userId);
    });

    collaborationService.onRoomUsers((users) => {
      console.log('Current users:', users);
      setUsers(users);
    });

    collaborationService.onUserCursorMove(({ userId, cursor }) => {
      updateUserCursor(userId, cursor);
    });

    setIsJoined(true);
  };

  const handleSelectTemplate = (template: Template) => {
    console.log('Selected template:', template);
    setShowTemplates(false);
    // TODO: Apply template to canvas
  };

  if (!isJoined) {
    return (
      <div className={`join-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="join-container">
          <h1>🎨 Living Taskboard</h1>
          <p>Real-time collaborative whiteboard with AI assistance</p>
          
          <div className="join-form">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="room-input"
            />
            <button onClick={handleJoinRoom} className="join-button">
              Join Whiteboard
            </button>
            <button 
              onClick={() => setShowTemplates(!showTemplates)} 
              className="template-button"
            >
              {showTemplates ? 'Hide Templates' : 'Browse Templates'}
            </button>
          </div>

          {showTemplates && (
            <div className="templates-container">
              <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <Toolbar />
      <WhiteboardCanvas roomId={roomId} />
    </div>
  );
}

export default App;
