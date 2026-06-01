import { replyService } from '../services/reply.service.js';

class ReplyController {
  /**
   * Bulk import past replies. Expects { creatorId, texts: [...] }
   */
  bulkImport = async (req, res, next) => {
    try {
      const { creatorId, texts } = req.body;
      const result = await replyService.bulkImportReplies(creatorId, texts);
      res.status(201).json({
        success: true,
        message: `Successfully imported ${result.importedCount} replies`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all replies for a creator. Path param: :creatorId
   */
  listByCreator = async (req, res, next) => {
    try {
      const { creatorId } = req.params;
      const replies = await replyService.getRepliesByCreator(creatorId);
      res.status(200).json({
        success: true,
        data: replies
      });
    } catch (error) {
      next(error);
    }
  };
}

export const replyController = new ReplyController();
export default replyController;
