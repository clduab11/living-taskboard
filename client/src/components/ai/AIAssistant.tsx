import React, { useState } from 'react';
import { FaMagic, FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './AIAssistant.css';

interface AIAssistantProps {
  onClose?: () => void;
  canvasObjects?: any[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, canvasObjects = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'generate' | 'format' | 'search'>('suggestions');

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && activeTab !== 'format') return;

    setLoading(true);
    setResponse('');

    try {
      let endpoint = '';
      let body: any = {};

      switch (activeTab) {
        case 'suggestions':
          endpoint = '/api/ai/suggestions';
          body = {
            prompt,
            canvasObjects,
          };
          break;
        case 'generate':
          endpoint = '/api/ai/generate';
          body = {
            description: prompt,
          };
          break;
        case 'format':
          endpoint = '/api/ai/format';
          body = {
            canvasObjects,
          };
          break;
        case 'search':
          endpoint = '/api/ai/search';
          body = {
            query: prompt,
            canvasObjects,
          };
          break;
      }

      const res = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.message);
        if (data.suggestions) {
          setResponse(prev => prev + '\n\nGenerated objects:\n' + JSON.stringify(data.suggestions, null, 2));
        }
      } else {
        setResponse(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = {
    suggestions: [
      'How can I improve the layout?',
      'Suggest a color scheme',
      'What\'s missing from this diagram?',
    ],
    generate: [
      'Create a flowchart for login process',
      'Generate a mind map about AI',
      'Make a kanban board layout',
    ],
    format: [
      'Analyze current layout',
    ],
    search: [
      'Find all text elements',
      'Show me rectangles',
    ],
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          <FaRobot className="ai-icon" />
          <h3>AI Assistant</h3>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        )}
      </div>

      <div className="ai-assistant-tabs">
        <button
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <FaMagic /> Suggestions
        </button>
        <button
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          ✨ Generate
        </button>
        <button
          className={`tab ${activeTab === 'format' ? 'active' : ''}`}
          onClick={() => setActiveTab('format')}
        >
          🎨 Format
        </button>
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search
        </button>
      </div>

      <div className="ai-assistant-content">
        <div className="quick-prompts">
          {quickPrompts[activeTab].map((qp, idx) => (
            <button
              key={idx}
              className="quick-prompt-button"
              onClick={() => setPrompt(qp)}
            >
              {qp}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="ai-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              activeTab === 'suggestions' 
                ? 'Ask for suggestions to improve your whiteboard...'
                : activeTab === 'generate'
                ? 'Describe what you want to create...'
                : activeTab === 'format'
                ? 'AI will analyze your current canvas...'
                : 'Search for objects on your canvas...'
            }
            rows={3}
            disabled={loading || activeTab === 'format'}
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || (activeTab !== 'format' && !prompt.trim())}
          >
            {loading ? (
              '⏳ Processing...'
            ) : (
              <>
                <FaPaperPlane /> {activeTab === 'format' ? 'Analyze' : 'Send'}
              </>
            )}
          </button>
        </form>

        {response && (
          <div className="ai-response">
            <h4>AI Response:</h4>
            <pre>{response}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
