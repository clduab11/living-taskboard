import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.post('/register', validate(schemas.register), authController.register.bind(authController));
router.post('/login', validate(schemas.login), authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.patch('/profile', authenticate, authController.updateProfile.bind(authController));

export default router;
