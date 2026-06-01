import { Router } from 'express';
import { questionController } from '../controllers/question.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const questionSchema = {
  creatorId: { required: true, type: 'string' },
  question: { required: true, type: 'string' }
};

router.post('/', validateBody(questionSchema), questionController.create);

export default router;
