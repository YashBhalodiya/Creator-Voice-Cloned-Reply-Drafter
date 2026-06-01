import { Router } from 'express';
import { draftController } from '../controllers/draft.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const draftSchema = {
  creatorId: { required: true, type: 'string' },
  questionId: { required: true, type: 'string' }
};

router.post('/generate', validateBody(draftSchema), draftController.generate);

export default router;
