import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { claudeService } from '../services/claude.service';
import { AIGenerationType } from '@living-taskboard/shared';

export class AIController {
  async generate(req: AuthRequest, res: Response) {
    try {
      const { prompt, type, context } = req.body;

      let result;

      switch (type) {
        case AIGenerationType.MIND_MAP:
          result = await claudeService.generateMindMap(prompt);
          break;

        case AIGenerationType.FLOWCHART:
          result = await claudeService.generateFlowchart(prompt);
          break;

        case AIGenerationType.AUTO_LAYOUT:
          if (!context?.objects) {
            throw new Error('Objects required for auto-layout');
          }
          result = await claudeService.autoLayout(context.objects);
          break;

        case AIGenerationType.MEETING_NOTES:
          if (!context?.objects) {
            throw new Error('Objects required for meeting notes');
          }
          const notes = await claudeService.generateMeetingNotes(context.objects);
          return res.json({ success: true, data: { notes } });

        case AIGenerationType.SMART_SHAPES:
          if (!context?.objects) {
            throw new Error('Objects required for smart shapes');
          }
          const suggestions = await claudeService.suggestConnections(context.objects);
          return res.json({ success: true, data: { suggestions } });

        default:
          throw new Error('Invalid generation type');
      }

      res.json({ success: true, data: { objects: result } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const aiController = new AIController();
