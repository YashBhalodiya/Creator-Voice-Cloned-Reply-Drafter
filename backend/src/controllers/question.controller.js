import { questionService } from '../services/question.service.js';

class QuestionController {
  /**
   * Log a new comment/question. Expects { creatorId, question }
   */
  create = async (req, res, next) => {
    try {
      const { creatorId, question } = req.body;
      const questionRecord = await questionService.createQuestion({ creatorId, question });
      res.status(201).json({
        success: true,
        message: 'Question logged successfully',
        data: questionRecord
      });
    } catch (error) {
      next(error);
    }
  };
}

export const questionController = new QuestionController();
export default questionController;
