import crypto from 'crypto';
import { evaluationRepository } from '../repositories/evaluation.repository.js';
import { creatorRepository } from '../repositories/creator.repository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class EvaluationService {
  /**
   * Logs a score and feedback for a creator's drafts.
   * @param {Object} payload Evaluation attributes.
   */
  async createEvaluation({ creatorId, score, feedback }) {
    // 1. Validate creator exists
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }

    // 2. Validate score range (1-5 star)
    if (typeof score !== 'number' || score < 1 || score > 5) {
      throw new ValidationError('Score must be a number between 1 and 5.');
    }

    const id = crypto.randomUUID();
    return evaluationRepository.create({ id, creatorId, score, feedback });
  }

  /**
   * Lists evaluations for a creator.
   * @param {string} creatorId The creator ID.
   */
  async getEvaluations(creatorId) {
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }
    return evaluationRepository.findByCreatorId(creatorId);
  }

  /**
   * Lists all evaluations.
   */
  async listAllEvaluations() {
    return evaluationRepository.findAll();
  }

  /**
   * Clears all evaluations.
   */
  async clearAllEvaluations() {
    return evaluationRepository.clearAll();
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;
