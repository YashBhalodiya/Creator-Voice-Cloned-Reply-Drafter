import crypto from 'crypto';
import { questionRepository } from '../repositories/question.repository.js';
import { creatorRepository } from '../repositories/creator.repository.js';
import { NotFoundError } from '../utils/errors.js';

class QuestionService {
  async createQuestion({ creatorId, question }) {
    // Validate creator exists
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }

    const id = crypto.randomUUID();
    return questionRepository.create({ id, creatorId, question });
  }

  async getQuestion(id) {
    const question = questionRepository.findById(id);
    if (!question) {
      throw new NotFoundError(`Question with ID ${id} not found.`);
    }
    return question;
  }

  async getQuestionsByCreator(creatorId) {
    // Validate creator exists
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }
    return questionRepository.findByCreatorId(creatorId);
  }
}

export const questionService = new QuestionService();
export default questionService;
