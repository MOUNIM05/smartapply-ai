/**
 * Couche service - experience.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Experience } = require("../models/experience.model");
const { sendNotification } = require("./notification-client.service");
const { getOrCreateProfileByUserId } = require("./profile-bootstrap.service");

const serializeExperience = (experience) => ({
  id: experience._id,
  profile_id: experience.profile_id,
  jobTitle: experience.jobTitle,
  company: experience.company,
  startDate: experience.startDate,
  endDate: experience.endDate,
  description: experience.description,
  skills: experience.skills,
  createdAt: experience.createdAt,
  updatedAt: experience.updatedAt
});

const getProfileByUserIdOrThrow = async (userId) => {
  return getOrCreateProfileByUserId(userId);
};

const getExperienceByIdForProfileOrThrow = async (profileId, experienceId) => {
  const experience = await Experience.findOne({
    _id: experienceId,
    profile_id: profileId
  });

  if (!experience) {
    const error = new Error("Experience not found");
    error.statusCode = 404;
    throw error;
  }

  return experience;
};

const listMyExperiences = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const experiences = await Experience.find({ profile_id: profile._id }).sort({
    createdAt: -1
  });

  return {
    experiences: experiences.map(serializeExperience)
  };
};

const createExperience = async (userId, payload) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const experience = await Experience.create({
    profile_id: profile._id,
    ...payload
  });

  await sendNotification({
    userId: String(userId),
    title: "Experience ajoutee",
    message: `Une nouvelle experience a ete ajoutee: ${experience.jobTitle} chez ${experience.company}.`,
    type: "experience",
    event: "experience_created",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      experienceId: String(experience._id)
    }
  });

  return {
    message: "Experience created successfully",
    experience: serializeExperience(experience)
  };
};

const updateExperience = async (userId, experienceId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const experience = await getExperienceByIdForProfileOrThrow(
    profile._id,
    experienceId
  );

  Object.assign(experience, updates);
  await experience.save();

  await sendNotification({
    userId: String(userId),
    title: "Experience mise a jour",
    message: `Votre experience ${experience.jobTitle} chez ${experience.company} a ete mise a jour.`,
    type: "experience",
    event: "experience_updated",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      experienceId: String(experience._id),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Experience updated successfully",
    experience: serializeExperience(experience)
  };
};

const deleteExperience = async (userId, experienceId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const experience = await getExperienceByIdForProfileOrThrow(profile._id, experienceId);
  await Experience.findByIdAndDelete(experienceId);

  await sendNotification({
    userId: String(userId),
    title: "Experience supprimee",
    message: `Votre experience ${experience.jobTitle} chez ${experience.company} a ete supprimee.`,
    type: "experience",
    event: "experience_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      experienceId: String(experience._id)
    }
  });

  return {
    message: "Experience deleted successfully"
  };
};

module.exports = {
  listMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};

