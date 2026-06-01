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

  list = async (req, res, next) => {
    try {
      const evaluations = await evaluationService.listAllEvaluations();
      res.status(200).json({
        success: true,
        data: evaluations
      });
    } catch (error) {
      next(error);
    }
  };

  clear = async (req, res, next) => {
    try {
      await evaluationService.clearAllEvaluations();
      res.status(200).json({
        success: true,
        message: 'All evaluations cleared successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export const evaluationController = new EvaluationController();
export default evaluationController;
