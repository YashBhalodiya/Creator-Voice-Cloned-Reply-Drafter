import { creatorService } from '../services/creator.service.js';

class CreatorController {
  create = async (req, res, next) => {
    try {
      const { name, persona } = req.body;
      const creator = await creatorService.createCreator({ name, persona });
      res.status(201).json({
        success: true,
        message: 'Creator profile created successfully',
        data: creator
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const creators = await creatorService.listCreators();
      res.status(200).json({
        success: true,
        data: creators
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const creator = await creatorService.getCreator(req.params.id);
      res.status(200).json({
        success: true,
        data: creator
      });
    } catch (error) {
      next(error);
    }
  };
}

export const creatorController = new CreatorController();
export default creatorController;
