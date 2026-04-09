const {
  validateCreateSkillRequest,
  validateUpdateSkillRequest
} = require("../schemas/skill.schema");
const {
  listMySkills,
  createSkill,
  updateSkill,
  deleteSkill
} = require("../services/skill.service");

const listMySkillsController = async (req, res, next) => {
  try {
    const result = await listMySkills(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createSkillController = async (req, res, next) => {
  try {
    const payload = validateCreateSkillRequest(req.body);
    const result = await createSkill(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateSkillController = async (req, res, next) => {
  try {
    const updates = validateUpdateSkillRequest(req.body);
    const result = await updateSkill(req.user.userId, req.params.id, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteSkillController = async (req, res, next) => {
  try {
    const result = await deleteSkill(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMySkillsController,
  createSkillController,
  updateSkillController,
  deleteSkillController
};
