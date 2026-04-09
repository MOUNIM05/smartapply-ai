const {
  validateCreateExperienceRequest,
  validateUpdateExperienceRequest
} = require("../schemas/experience.schema");
const {
  listMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience
} = require("../services/experience.service");

const listMyExperiencesController = async (req, res, next) => {
  try {
    const result = await listMyExperiences(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createExperienceController = async (req, res, next) => {
  try {
    const payload = validateCreateExperienceRequest(req.body);
    const result = await createExperience(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateExperienceController = async (req, res, next) => {
  try {
    const updates = validateUpdateExperienceRequest(req.body);
    const result = await updateExperience(
      req.user.userId,
      req.params.id,
      updates
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteExperienceController = async (req, res, next) => {
  try {
    const result = await deleteExperience(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyExperiencesController,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController
};
