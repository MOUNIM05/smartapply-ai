/**
 * Couche service - experience.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Profile } = require("../models/profile.model");
const { Experience } = require("../models/experience.model");

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
  const profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
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

  return {
    message: "Experience updated successfully",
    experience: serializeExperience(experience)
  };
};

const deleteExperience = async (userId, experienceId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  await getExperienceByIdForProfileOrThrow(profile._id, experienceId);
  await Experience.findByIdAndDelete(experienceId);

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

