import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', templateController.getPublicTemplates.bind(templateController));
router.get('/category/:category', templateController.getByCategory.bind(templateController));
router.get('/:id', templateController.getTemplate.bind(templateController));

// Protected routes
router.get('/user/my', authenticate, templateController.getUserTemplates.bind(templateController));
router.post('/', authenticate, templateController.createTemplate.bind(templateController));
router.delete('/:id', authenticate, templateController.deleteTemplate.bind(templateController));

export default router;
