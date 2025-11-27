import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { templateService } from '../services/template.service';

export class TemplateController {
  async getPublicTemplates(req: Request, res: Response) {
    try {
      const templates = await templateService.getPublicTemplates();
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserTemplates(req: AuthRequest, res: Response) {
    try {
      const templates = await templateService.getUserTemplates(req.user!.id);
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await templateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const templates = await templateService.getTemplatesByCategory(category as any);
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTemplate(req: AuthRequest, res: Response) {
    try {
      const { name, description, category, data, tags, isPublic } = req.body;

      const template = await templateService.createTemplate(
        req.user!.id,
        name,
        description,
        category,
        data,
        tags,
        isPublic
      );

      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await templateService.deleteTemplate(id, req.user!.id);
      res.json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const templateController = new TemplateController();
