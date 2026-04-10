/**
 * Controleur HTTP - education.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
const {
  validateCreateEducationRequest,
  validateUpdateEducationRequest
} = require("../schemas/education.schema");
const {
  listMyEducations,
  createEducation,
  updateEducation,
  deleteEducation
} = require("../services/education.service");

const listMyEducationsController = async (req, res, next) => {
  try {
    const result = await listMyEducations(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createEducationController = async (req, res, next) => {
  try {
    const payload = validateCreateEducationRequest(req.body);
    const result = await createEducation(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateEducationController = async (req, res, next) => {
  try {
    const updates = validateUpdateEducationRequest(req.body);
    const result = await updateEducation(req.user.userId, req.params.id, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteEducationController = async (req, res, next) => {
  try {
    const result = await deleteEducation(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyEducationsController,
  createEducationController,
  updateEducationController,
  deleteEducationController
};

