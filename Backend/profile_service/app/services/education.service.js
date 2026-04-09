const { Profile } = require("../models/profile.model");
const { Education } = require("../models/education.model");

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
  const profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
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

  return {
    message: "Education updated successfully",
    education: serializeEducation(education)
  };
};

const deleteEducation = async (userId, educationId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  await getEducationByIdForProfileOrThrow(profile._id, educationId);
  await Education.findByIdAndDelete(educationId);

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
