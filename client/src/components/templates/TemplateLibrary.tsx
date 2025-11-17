import React, { useState } from 'react';
import type { Template } from '../../types';
import './TemplateLibrary.css';

const templates: Template[] = [
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    description: 'Simple flowchart template with start, process, and end shapes',
    category: 'flowchart',
    objects: [],
  },
  {
    id: 'wireframe-mobile',
    name: 'Mobile Wireframe',
    description: 'Mobile app wireframe template',
    category: 'wireframe',
    objects: [],
  },
  {
    id: 'mindmap-central',
    name: 'Central Mind Map',
    description: 'Mind map with central concept',
    category: 'mindmap',
    objects: [],
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'Task management kanban board',
    category: 'kanban',
    objects: [],
  },
];

interface TemplateLibraryProps {
  onSelectTemplate?: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'flowchart', 'wireframe', 'mindmap', 'kanban'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="template-library">
      <div className="template-header">
        <h2>Templates</h2>
        <p>Start with a template to get going quickly</p>
      </div>

      <div className="template-categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="template-grid">
        {filteredTemplates.map(template => (
          <div 
            key={template.id} 
            className="template-card"
            onClick={() => onSelectTemplate?.(template)}
          >
            <div className="template-thumbnail">
              <div className="template-placeholder">
                {template.name.charAt(0)}
              </div>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
