/**
 * Couche service - education.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Education } = require("../models/education.model");
const { sendNotification } = require("./notification-client.service");
const { getOrCreateProfileByUserId } = require("./profile-bootstrap.service");

const serializeEducation = (education) => ({
  id: education._id,
  profile_id: education.profile_id,
  title: education.title,
  school: education.school,
  period: education.period,
  createdAt: education.createdAt,
  updatedAt: education.updatedAt
});

const getProfileByUserIdOrThrow = async (userId) => {
  return getOrCreateProfileByUserId(userId);
};

const getEducationByIdForProfileOrThrow = async (profileId, educationId) => {
  const education = await Education.findOne({
    _id: educationId,
    profile_id: profileId
  });

  if (!education) {
    const error = new Error("Education not found");
    error.statusCode = 404;
    throw error;
  }

  return education;
};

const listMyEducations = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const educations = await Education.find({ profile_id: profile._id }).sort({
    createdAt: -1
  });

  return {
    educations: educations.map(serializeEducation)
  };
};

const createEducation = async (userId, payload) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const education = await Education.create({
    profile_id: profile._id,
    ...payload
  });

  await sendNotification({
    userId: String(userId),
    title: "Formation ajoutee",
    message: `Une nouvelle formation a ete ajoutee: ${education.title} a ${education.school}.`,
    type: "education",
    event: "education_created",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      educationId: String(education._id)
    }
  });

  return {
    message: "Education created successfully",
    education: serializeEducation(education)
  };
};

const updateEducation = async (userId, educationId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const education = await getEducationByIdForProfileOrThrow(
    profile._id,
    educationId
  );

  Object.assign(education, updates);
  await education.save();

  await sendNotification({
    userId: String(userId),
    title: "Formation mise a jour",
    message: `Votre formation ${education.title} a ${education.school} a ete mise a jour.`,
    type: "education",
    event: "education_updated",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      educationId: String(education._id),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Education updated successfully",
    education: serializeEducation(education)
  };
};

const deleteEducation = async (userId, educationId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const education = await getEducationByIdForProfileOrThrow(profile._id, educationId);
  await Education.findByIdAndDelete(educationId);

  await sendNotification({
    userId: String(userId),
    title: "Formation supprimee",
    message: `Votre formation ${education.title} a ${education.school} a ete supprimee.`,
    type: "education",
    event: "education_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      educationId: String(education._id)
    }
  });

  return {
    message: "Education deleted successfully"
  };
};

module.exports = {
  listMyEducations,
  createEducation,
  updateEducation,
  deleteEducation
};

