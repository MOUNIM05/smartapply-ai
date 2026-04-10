/**
 * Controleur HTTP - job.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
const {
  validateCreateApplicationRequest,
  validateCreateJobOfferRequest
} = require("../schemas/job.schema");
const {
  createJobOffer,
  listJobOffers,
  getJobOfferById,
  createApplication,
  listApplications,
  getApplicationById
} = require("../services/job.service");

const createJobOfferController = async (req, res, next) => {
  try {
    const payload = validateCreateJobOfferRequest(req.body);
    const result = await createJobOffer(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listJobOffersController = async (req, res, next) => {
  try {
    const result = await listJobOffers();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getJobOfferByIdController = async (req, res, next) => {
  try {
    const result = await getJobOfferById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createApplicationController = async (req, res, next) => {
  try {
    const payload = validateCreateApplicationRequest(req.body);
    const result = await createApplication(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listApplicationsController = async (req, res, next) => {
  try {
    const result = await listApplications();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getApplicationByIdController = async (req, res, next) => {
  try {
    const result = await getApplicationById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobOfferController,
  listJobOffersController,
  getJobOfferByIdController,
  createApplicationController,
  listApplicationsController,
  getApplicationByIdController
};

