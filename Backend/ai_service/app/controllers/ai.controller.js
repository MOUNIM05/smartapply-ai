/**
 * Controleur HTTP - ai.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
const {
  validateCreateAIModelRequest,
  validateCreateAIGenerationRequest,
  validateCreateAIGenerationResponseRequest,
  validateParseCVUploadRequest
} = require("../schemas/ai.schema");
const {
  createAIModel,
  listAIModels,
  getAIModelById,
  createAIGenerationRequest,
  listAIGenerationRequests,
  getAIGenerationRequestById,
  createAIGenerationResponse,
  listAIGenerationResponses,
  getAIGenerationResponseById,
  parseCVUpload
} = require("../services/ai.service");

const createAIModelController = async (req, res, next) => {
  try {
    const payload = validateCreateAIModelRequest(req.body);
    const result = await createAIModel(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listAIModelsController = async (req, res, next) => {
  try {
    const result = await listAIModels();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAIModelByIdController = async (req, res, next) => {
  try {
    const result = await getAIModelById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createAIGenerationRequestController = async (req, res, next) => {
  try {
    const payload = validateCreateAIGenerationRequest(req.body);
    const result = await createAIGenerationRequest(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listAIGenerationRequestsController = async (req, res, next) => {
  try {
    const result = await listAIGenerationRequests(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAIGenerationRequestByIdController = async (req, res, next) => {
  try {
    const result = await getAIGenerationRequestById(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createAIGenerationResponseController = async (req, res, next) => {
  try {
    const payload = validateCreateAIGenerationResponseRequest(req.body);
    const result = await createAIGenerationResponse(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listAIGenerationResponsesController = async (req, res, next) => {
  try {
    const result = await listAIGenerationResponses(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAIGenerationResponseByIdController = async (req, res, next) => {
  try {
    const result = await getAIGenerationResponseById(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const parseCVUploadController = async (req, res, next) => {
  try {
    const payload = validateParseCVUploadRequest(req.body);
    const result = await parseCVUpload(req.user.userId, payload);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAIModelController,
  listAIModelsController,
  getAIModelByIdController,
  createAIGenerationRequestController,
  listAIGenerationRequestsController,
  getAIGenerationRequestByIdController,
  createAIGenerationResponseController,
  listAIGenerationResponsesController,
  getAIGenerationResponseByIdController,
  parseCVUploadController
};

