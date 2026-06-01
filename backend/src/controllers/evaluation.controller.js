import { evaluationService } from '../services/evaluation.service.js';

class EvaluationController {
  /**
   * Log feedback rating. Expects { creatorId, score, feedback }
   */
  create = async (req, res, next) => {
    try {
      const { creatorId, score, feedback } = req.body;
      const evaluation = await evaluationService.createEvaluation({ creatorId, score, feedback });
      res.status(201).json({
        success: true,
        message: 'Evaluation saved successfully',
        data: evaluation
      });
    } catch (error) {
      next(error);
    }
  };
}

export const evaluationController = new EvaluationController();
export default evaluationController;
