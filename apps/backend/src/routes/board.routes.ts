import { Router } from 'express';
import { boardController } from '../controllers/board.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, validate(schemas.createBoard), boardController.createBoard.bind(boardController));
router.get('/', authenticate, boardController.getUserBoards.bind(boardController));
router.get('/:id', optionalAuth, boardController.getBoard.bind(boardController));
router.patch('/:id', authenticate, validate(schemas.updateBoard), boardController.updateBoard.bind(boardController));
router.delete('/:id', authenticate, boardController.deleteBoard.bind(boardController));
router.post('/:id/share', authenticate, boardController.shareBoard.bind(boardController));

export default router;
