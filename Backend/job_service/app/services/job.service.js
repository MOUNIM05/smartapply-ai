/**
 * Couche service - job.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Application } = require("../models/application.model");
const { JobOffer } = require("../models/job-offer.model");

const serializeJobOffer = (jobOffer) => ({
  id: jobOffer._id,
  jobTitle: jobOffer.jobTitle,
  company: jobOffer.company,
  description: jobOffer.description,
  location: jobOffer.location,
  employmentType: jobOffer.employmentType,
  addedAt: jobOffer.addedAt,
  createdAt: jobOffer.createdAt,
  updatedAt: jobOffer.updatedAt
});

const serializeApplication = (application) => ({
  id: application._id,
  profileId: application.profileId,
  jobOfferId: application.jobOfferId,
  appliedAt: application.appliedAt,
  status: application.status,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt
});

const createJobOffer = async (payload) => {
  const jobOffer = await JobOffer.create(payload);

  return {
    message: "Job offer created successfully",
    jobOffer: serializeJobOffer(jobOffer)
  };
};

const listJobOffers = async () => {
  const jobOffers = await JobOffer.find().sort({ createdAt: -1 });

  return {
    jobOffers: jobOffers.map(serializeJobOffer)
  };
};

const getJobOfferById = async (jobOfferId) => {
  const jobOffer = await JobOffer.findById(jobOfferId);

  if (!jobOffer) {
    const error = new Error("Job offer not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    jobOffer: serializeJobOffer(jobOffer)
  };
};

const createApplication = async ({ profileId, jobOfferId, status }) => {
  const jobOffer = await JobOffer.findById(jobOfferId);

  if (!jobOffer) {
    const error = new Error("Job offer not found");
    error.statusCode = 404;
    throw error;
  }

  const application = await Application.create({
    profileId,
    jobOfferId,
    status
  });

  return {
    message: "Application created successfully",
    application: serializeApplication(application)
  };
};

const listApplications = async () => {
  const applications = await Application.find().sort({ createdAt: -1 });

  return {
    applications: applications.map(serializeApplication)
  };
};

const getApplicationById = async (applicationId) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    application: serializeApplication(application)
  };
};

module.exports = {
  createJobOffer,
  listJobOffers,
  getJobOfferById,
  createApplication,
  listApplications,
  getApplicationById
};

