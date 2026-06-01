import { Router } from 'express';
import { evaluationController } from '../controllers/evaluation.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const evaluationSchema = {
  creatorId: { required: true, type: 'string' },
  score: {
    required: true,
    type: 'number',
    custom: (v) => v >= 1 && v <= 5,
    message: 'Score must be a number between 1 and 5.'
  },
  feedback: { required: false, type: 'string' }
};

router.post('/', validateBody(evaluationSchema), evaluationController.create);
router.get('/', evaluationController.list);
router.delete('/', evaluationController.clear);

export default router;
