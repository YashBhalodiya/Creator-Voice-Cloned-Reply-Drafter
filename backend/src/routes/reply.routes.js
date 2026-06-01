import { Router } from 'express';
import { replyController } from '../controllers/reply.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const replyBulkSchema = {
  creatorId: { required: true, type: 'string' },
  texts: { required: true, type: 'array' }
};

router.post('/bulk', validateBody(replyBulkSchema), replyController.bulkImport);
router.get('/:creatorId', replyController.listByCreator);

export default router;
