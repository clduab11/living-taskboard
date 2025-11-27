import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, aiController.generate.bind(aiController));

export default router;
