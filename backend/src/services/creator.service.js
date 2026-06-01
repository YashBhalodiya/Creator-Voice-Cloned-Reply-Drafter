import crypto from 'crypto';
import { creatorRepository } from '../repositories/creator.repository.js';
import { NotFoundError } from '../utils/errors.js';

class CreatorService {
  async createCreator({ name, persona, styleFeatures = null }) {
    const id = crypto.randomUUID();
    return creatorRepository.create({ id, name, persona, styleFeatures });
  }

  async updateCreatorStyle(id, styleFeatures) {
    // Ensure creator exists
    await this.getCreator(id);
    return creatorRepository.updateStyle(id, styleFeatures);
  }

  async getCreator(id) {
    const creator = creatorRepository.findById(id);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${id} not found.`);
    }
    return creator;
  }

  async listCreators() {
    return creatorRepository.findAll();
  }
}

export const creatorService = new CreatorService();
export default creatorService;
