import { Router } from 'express';
import { creatorController } from '../controllers/creator.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const creatorSchema = {
  name: { required: true, type: 'string' },
  persona: { required: true, type: 'string' }
};

router.post('/', validateBody(creatorSchema), creatorController.create);
router.get('/', creatorController.list);
router.get('/:id', creatorController.get);

export default router;
