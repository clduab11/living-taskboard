import { Router } from 'express';
import { versionController } from '../controllers/version.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/boards/:boardId/versions', authenticate, versionController.getVersions.bind(versionController));
router.post('/boards/:boardId/versions', authenticate, versionController.createVersion.bind(versionController));
router.post('/boards/:boardId/versions/:versionId/restore', authenticate, versionController.restoreVersion.bind(versionController));
router.get('/boards/:boardId/versions/diff', authenticate, versionController.getDiff.bind(versionController));

export default router;
