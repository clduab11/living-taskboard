import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env';
import { AIGenerationType, CanvasObject, ObjectType } from '@living-taskboard/shared';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey
    });
  }

  async generateMindMap(prompt: string): Promise<CanvasObject[]> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Generate a mind map structure from this prompt: "${prompt}".

Return a JSON array of objects with this structure:
[{
  "text": "Main Topic",
  "position": {"x": 400, "y": 300},
  "children": [{
    "text": "Subtopic 1",
    "position": {"x": 200, "y": 200}
  }]
}]

Make the layout hierarchical and spread out. Position nodes in a radial pattern around the main topic.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse the JSON response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse mind map data');
    }

    const mindMapData = JSON.parse(jsonMatch[0]);
    return this.convertMindMapToObjects(mindMapData);
  }

  async generateFlowchart(prompt: string): Promise<CanvasObject[]> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Generate a flowchart structure from this prompt: "${prompt}".

Return a JSON array representing flowchart nodes and connections:
[{
  "id": "start",
  "type": "oval",
  "text": "Start",
  "position": {"x": 400, "y": 50}
}, {
  "id": "step1",
  "type": "rectangle",
  "text": "Process step",
  "position": {"x": 400, "y": 150}
}]

Include decision diamonds, process rectangles, and flow arrows.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse flowchart data');
    }

    const flowchartData = JSON.parse(jsonMatch[0]);
    return this.convertFlowchartToObjects(flowchartData);
  }

  async autoLayout(objects: CanvasObject[]): Promise<CanvasObject[]> {
    const description = this.describeObjects(objects);

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Given these canvas objects: ${description}

Suggest an optimal layout by returning new positions for each object.
Return JSON: [{"id": "obj-id", "position": {"x": 100, "y": 200}}]

Organize hierarchically, minimize crossings, and ensure good spacing.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse layout data');
    }

    const layoutData = JSON.parse(jsonMatch[0]);
    return this.applyLayout(objects, layoutData);
  }

  async generateMeetingNotes(objects: CanvasObject[]): Promise<string> {
    const description = this.describeObjects(objects);

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Based on this whiteboard content: ${description}

Generate professional meeting notes in markdown format with:
- Summary
- Key points
- Action items
- Decisions made`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return content.text;
  }

  async suggestConnections(objects: CanvasObject[]): Promise<Array<{from: string, to: string, reason: string}>> {
    const description = this.describeObjects(objects);

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Given these objects: ${description}

Suggest logical connections between them. Return JSON:
[{"from": "id1", "to": "id2", "reason": "why they're related"}]`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    return JSON.parse(jsonMatch[0]);
  }

  private describeObjects(objects: CanvasObject[]): string {
    return objects.map(obj => {
      let description = `${obj.type} at (${obj.position.x}, ${obj.position.y})`;

      if (obj.type === ObjectType.TEXT && 'text' in obj.data) {
        description += `: "${obj.data.text}"`;
      } else if (obj.type === ObjectType.STICKY_NOTE && 'text' in obj.data) {
        description += `: "${obj.data.text}"`;
      }

      return description;
    }).join('; ');
  }

  private convertMindMapToObjects(mindMapData: any[]): CanvasObject[] {
    const objects: CanvasObject[] = [];
    let objectId = 0;

    const processNode = (node: any, parentId?: string) => {
      const id = `mind-map-${objectId++}`;

      objects.push({
        id,
        boardId: '', // Will be set by caller
        type: ObjectType.STICKY_NOTE,
        position: node.position,
        size: { width: 150, height: 100 },
        rotation: 0,
        zIndex: 0,
        locked: false,
        visible: true,
        data: {
          text: node.text,
          color: parentId ? '#FFE5B4' : '#FFB6C1',
          fontSize: parentId ? 14 : 18
        },
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as CanvasObject);

      if (parentId) {
        // Add connection line
        objects.push({
          id: `line-${objectId++}`,
          boardId: '',
          type: ObjectType.LINE,
          position: node.position,
          size: { width: 0, height: 0 },
          rotation: 0,
          zIndex: -1,
          locked: false,
          visible: true,
          data: {
            pathData: `M${node.position.x},${node.position.y}`,
            fill: 'none',
            stroke: '#666',
            strokeWidth: 2
          },
          createdBy: '',
          createdAt: new Date(),
          updatedAt: new Date()
        } as CanvasObject);
      }

      if (node.children) {
        node.children.forEach((child: any) => processNode(child, id));
      }
    };

    mindMapData.forEach(node => processNode(node));
    return objects;
  }

  private convertFlowchartToObjects(flowchartData: any[]): CanvasObject[] {
    return flowchartData.map((node, index) => ({
      id: node.id || `flowchart-${index}`,
      boardId: '',
      type: node.type === 'oval' ? ObjectType.CIRCLE : ObjectType.RECTANGLE,
      position: node.position,
      size: { width: 150, height: 80 },
      rotation: 0,
      zIndex: 0,
      locked: false,
      visible: true,
      data: {
        fill: '#E8F4F8',
        stroke: '#4A90E2',
        strokeWidth: 2,
        cornerRadius: 5
      },
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as CanvasObject));
  }

  private applyLayout(objects: CanvasObject[], layoutData: any[]): CanvasObject[] {
    const layoutMap = new Map(layoutData.map(l => [l.id, l.position]));

    return objects.map(obj => {
      const newPosition = layoutMap.get(obj.id);
      if (newPosition) {
        return { ...obj, position: newPosition };
      }
      return obj;
    });
  }
}

export const claudeService = new ClaudeService();
