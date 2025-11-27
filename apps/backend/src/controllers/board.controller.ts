import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { boardService } from '../services/board.service';

export class BoardController {
  async createBoard(req: AuthRequest, res: Response) {
    try {
      const { name, description, visibility, settings } = req.body;
      const board = await boardService.createBoard(
        req.user!.id,
        name,
        description,
        visibility,
        settings
      );
      res.status(201).json({ success: true, data: board });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const board = await boardService.getBoard(id, req.user?.id);
      res.json({ success: true, data: board });
    } catch (error: any) {
      const status = error.message === 'Board not found' ? 404 : 403;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  async getUserBoards(req: AuthRequest, res: Response) {
    try {
      const boards = await boardService.getBoardsByUser(req.user!.id);
      res.json({ success: true, data: boards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const board = await boardService.updateBoard(id, req.user!.id, updates);
      res.json({ success: true, data: board });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await boardService.deleteBoard(id, req.user!.id);
      res.json({ success: true, message: 'Board deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async shareBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { email, role } = req.body;
      await boardService.shareBoardWithUser(id, req.user!.id, email, role);
      res.json({ success: true, message: 'Board shared successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const boardController = new BoardController();
