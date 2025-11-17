import { query } from '../config/database';
import { TemplateCategory, CanvasObject, ObjectType } from '@living-taskboard/shared';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  data: CanvasObject[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export class TemplateService {
  // Get all public templates
  async getPublicTemplates(): Promise<Template[]> {
    const result = await query(
      `SELECT * FROM templates WHERE is_public = true ORDER BY category, name`
    );

    return result.rows.map(this.mapTemplate);
  }

  // Get user templates
  async getUserTemplates(userId: string): Promise<Template[]> {
    const result = await query(
      `SELECT * FROM templates WHERE created_by = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(this.mapTemplate);
  }

  // Get template by ID
  async getTemplateById(templateId: string): Promise<Template | null> {
    const result = await query(
      'SELECT * FROM templates WHERE id = $1',
      [templateId]
    );

    if (result.rows.length === 0) return null;
    return this.mapTemplate(result.rows[0]);
  }

  // Get templates by category
  async getTemplatesByCategory(category: TemplateCategory): Promise<Template[]> {
    const result = await query(
      `SELECT * FROM templates WHERE category = $1 AND is_public = true ORDER BY name`,
      [category]
    );

    return result.rows.map(this.mapTemplate);
  }

  // Create custom template
  async createTemplate(
    userId: string,
    name: string,
    description: string,
    category: TemplateCategory,
    data: CanvasObject[],
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<Template> {
    const result = await query(
      `INSERT INTO templates (name, description, category, data, tags, is_public, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, category, JSON.stringify(data), tags, isPublic, userId]
    );

    return this.mapTemplate(result.rows[0]);
  }

  // Delete template
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const result = await query(
      'DELETE FROM templates WHERE id = $1 AND created_by = $2',
      [templateId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('Template not found or unauthorized');
    }
  }

  // Seed default templates
  async seedDefaultTemplates(): Promise<void> {
    const defaults = this.getDefaultTemplates();

    for (const template of defaults) {
      // Check if template exists
      const existing = await query(
        'SELECT 1 FROM templates WHERE name = $1 AND is_public = true',
        [template.name]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO templates (name, description, category, data, tags, is_public, created_by)
           VALUES ($1, $2, $3, $4, $5, true, $6)`,
          [
            template.name,
            template.description,
            template.category,
            JSON.stringify(template.data),
            template.tags,
            '00000000-0000-0000-0000-000000000000' // System user
          ]
        );
      }
    }
  }

  private getDefaultTemplates(): Omit<Template, 'id' | 'createdAt' | 'createdBy' | 'isPublic'>[] {
    return [
      {
        name: 'Blank Canvas',
        description: 'Start with a clean slate',
        category: TemplateCategory.OTHER,
        data: [],
        tags: ['blank', 'empty', 'start'],
        thumbnail: undefined
      },
      {
        name: 'Brainstorming',
        description: 'Grid of sticky notes for brainstorming sessions',
        category: TemplateCategory.OTHER,
        data: this.generateBrainstormingTemplate(),
        tags: ['brainstorm', 'ideas', 'sticky notes'],
        thumbnail: undefined
      },
      {
        name: 'Flowchart',
        description: 'Process flow with decision nodes',
        category: TemplateCategory.FLOWCHART,
        data: this.generateFlowchartTemplate(),
        tags: ['flow', 'process', 'decision'],
        thumbnail: undefined
      },
      {
        name: 'Mind Map',
        description: 'Central topic with branching ideas',
        category: TemplateCategory.MIND_MAP,
        data: this.generateMindMapTemplate(),
        tags: ['mind map', 'ideas', 'hierarchy'],
        thumbnail: undefined
      },
      {
        name: 'Wireframe - Mobile',
        description: 'Mobile app screen mockup',
        category: TemplateCategory.WIREFRAME,
        data: this.generateWireframeTemplate(),
        tags: ['wireframe', 'mobile', 'ui', 'mockup'],
        thumbnail: undefined
      },
      {
        name: 'Kanban Board',
        description: 'Three-column task board',
        category: TemplateCategory.KANBAN,
        data: this.generateKanbanTemplate(),
        tags: ['kanban', 'tasks', 'agile'],
        thumbnail: undefined
      },
      {
        name: 'Org Chart',
        description: 'Organizational hierarchy structure',
        category: TemplateCategory.DIAGRAM,
        data: this.generateOrgChartTemplate(),
        tags: ['org chart', 'hierarchy', 'organization'],
        thumbnail: undefined
      }
    ];
  }

  private generateBrainstormingTemplate(): CanvasObject[] {
    const objects: CanvasObject[] = [];
    const colors = ['#FFEB3B', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0'];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        objects.push({
          id: `brainstorm-${row}-${col}`,
          boardId: '',
          type: ObjectType.STICKY_NOTE,
          position: { x: 100 + col * 220, y: 100 + row * 220 },
          size: { width: 200, height: 200 },
          rotation: 0,
          zIndex: 0,
          locked: false,
          visible: true,
          data: {
            text: 'Add idea...',
            color: colors[(row * 4 + col) % colors.length],
            fontSize: 14
          },
          createdBy: '',
          createdAt: new Date(),
          updatedAt: new Date()
        } as CanvasObject);
      }
    }

    return objects;
  }

  private generateFlowchartTemplate(): CanvasObject[] {
    return [
      // Start
      {
        id: 'flow-start',
        boardId: '',
        type: ObjectType.CIRCLE,
        position: { x: 400, y: 50 },
        size: { width: 100, height: 60 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#E8F5E9', stroke: '#4CAF50', strokeWidth: 2, radius: 30 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Process 1
      {
        id: 'flow-process-1',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 375, y: 150 },
        size: { width: 150, height: 80 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#E3F2FD', stroke: '#2196F3', strokeWidth: 2, cornerRadius: 5 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Decision
      {
        id: 'flow-decision',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 375, y: 280 },
        size: { width: 150, height: 80 },
        rotation: 45,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#FFF3E0', stroke: '#FF9800', strokeWidth: 2, cornerRadius: 0 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // End
      {
        id: 'flow-end',
        boardId: '',
        type: ObjectType.CIRCLE,
        position: { x: 400, y: 450 },
        size: { width: 100, height: 60 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#FFEBEE', stroke: '#F44336', strokeWidth: 2, radius: 30 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject
    ];
  }

  private generateMindMapTemplate(): CanvasObject[] {
    return [
      // Central node
      {
        id: 'mindmap-center',
        boardId: '',
        type: ObjectType.CIRCLE,
        position: { x: 400, y: 300 },
        size: { width: 150, height: 150 },
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        data: { fill: '#3F51B5', stroke: '#1A237E', strokeWidth: 3, radius: 75 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Branch nodes
      ...['#F44336', '#4CAF50', '#2196F3', '#FF9800'].map((color, i) => ({
        id: `mindmap-branch-${i}`,
        boardId: '',
        type: ObjectType.CIRCLE,
        position: {
          x: 400 + Math.cos((i * Math.PI) / 2) * 200,
          y: 300 + Math.sin((i * Math.PI) / 2) * 200
        },
        size: { width: 100, height: 100 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: color, stroke: '#333', strokeWidth: 2, radius: 50 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject))
    ];
  }

  private generateWireframeTemplate(): CanvasObject[] {
    return [
      // Phone frame
      {
        id: 'wireframe-phone',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 350, y: 50 },
        size: { width: 300, height: 600 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#FAFAFA', stroke: '#333', strokeWidth: 3, cornerRadius: 30 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Status bar
      {
        id: 'wireframe-status',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 360, y: 60 },
        size: { width: 280, height: 30 },
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        data: { fill: '#E0E0E0', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Header
      {
        id: 'wireframe-header',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 360, y: 95 },
        size: { width: 280, height: 50 },
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        data: { fill: '#2196F3', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject
    ];
  }

  private generateKanbanTemplate(): CanvasObject[] {
    const columns = ['To Do', 'In Progress', 'Done'];
    const objects: CanvasObject[] = [];

    columns.forEach((title, i) => {
      // Column header
      objects.push({
        id: `kanban-header-${i}`,
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 100 + i * 280, y: 50 },
        size: { width: 260, height: 50 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: {
          fill: i === 0 ? '#E3F2FD' : i === 1 ? '#FFF3E0' : '#E8F5E9',
          stroke: '#333',
          strokeWidth: 1,
          cornerRadius: 5
        },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject);

      // Column area
      objects.push({
        id: `kanban-area-${i}`,
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 100 + i * 280, y: 110 },
        size: { width: 260, height: 500 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#F5F5F5', stroke: '#E0E0E0', strokeWidth: 1, cornerRadius: 5 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject);
    });

    return objects;
  }

  private generateOrgChartTemplate(): CanvasObject[] {
    return [
      // CEO
      {
        id: 'org-ceo',
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 375, y: 50 },
        size: { width: 150, height: 60 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: '#3F51B5', stroke: '#1A237E', strokeWidth: 2, cornerRadius: 5 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject,
      // Directors
      ...['#2196F3', '#2196F3', '#2196F3'].map((color, i) => ({
        id: `org-director-${i}`,
        boardId: '',
        type: ObjectType.RECTANGLE,
        position: { x: 175 + i * 200, y: 180 },
        size: { width: 120, height: 50 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: { fill: color, stroke: '#0D47A1', strokeWidth: 2, cornerRadius: 5 },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject))
    ];
  }

  private mapTemplate(row: any): Template {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      thumbnail: row.thumbnail,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      tags: row.tags || [],
      isPublic: row.is_public,
      createdBy: row.created_by,
      createdAt: row.created_at
    };
  }
}

export const templateService = new TemplateService();
