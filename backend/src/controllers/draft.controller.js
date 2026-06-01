import { draftService } from '../services/draft.service.js';

class DraftController {
  /**
   * Generate cloning draft options. Expects { creatorId, questionId }
   */
  generate = async (req, res, next) => {
    try {
      const { creatorId, questionId } = req.body;
      const drafts = await draftService.generateDrafts({ creatorId, questionId });
      res.status(200).json({
        success: true,
        message: 'Drafts generated and ranked successfully',
        data: drafts
      });
    } catch (error) {
      next(error);
    }
  };
}

export const draftController = new DraftController();
export default draftController;
