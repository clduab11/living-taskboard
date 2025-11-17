import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { versionService } from '../services/version.service';
import { boardService } from '../services/board.service';

export class VersionController {
  async getVersions(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;

      // Check board access
      const hasAccess = await boardService.checkBoardAccess(boardId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const versions = await versionService.getVersions(boardId);
      res.json({ success: true, data: versions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createVersion(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const { objects, description } = req.body;

      // Check board access
      const hasAccess = await boardService.checkBoardAccess(boardId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const version = await versionService.createVersion(
        boardId,
        req.user!.id,
        objects,
        description
      );

      res.status(201).json({ success: true, data: version });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async restoreVersion(req: AuthRequest, res: Response) {
    try {
      const { boardId, versionId } = req.params;

      // Check board access
      const hasAccess = await boardService.checkBoardAccess(boardId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      await versionService.restoreVersion(boardId, versionId, req.user!.id);
      res.json({ success: true, message: 'Version restored' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getDiff(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const { from, to } = req.query;

      // Check board access
      const hasAccess = await boardService.checkBoardAccess(boardId, req.user!.id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const diff = await versionService.getDiff(
        boardId,
        parseInt(from as string),
        parseInt(to as string)
      );

      res.json({ success: true, data: diff });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const versionController = new VersionController();
