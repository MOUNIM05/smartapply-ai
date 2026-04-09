const { Profile } = require("../models/profile.model");
const { Language } = require("../models/language.model");

const serializeLanguage = (language) => ({
  id: language._id,
  profile_id: language.profile_id,
  name: language.name,
  level: language.level,
  createdAt: language.createdAt,
  updatedAt: language.updatedAt
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

const getLanguageByIdForProfileOrThrow = async (profileId, languageId) => {
  const language = await Language.findOne({
    _id: languageId,
    profile_id: profileId
  });

  if (!language) {
    const error = new Error("Language not found");
    error.statusCode = 404;
    throw error;
  }

  return language;
};

const listMyLanguages = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const languages = await Language.find({ profile_id: profile._id }).sort({
    createdAt: -1
  });

  return {
    languages: languages.map(serializeLanguage)
  };
};

const createLanguage = async (userId, payload) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const language = await Language.create({
    profile_id: profile._id,
    ...payload
  });

  return {
    message: "Language created successfully",
    language: serializeLanguage(language)
  };
};

const updateLanguage = async (userId, languageId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const language = await getLanguageByIdForProfileOrThrow(
    profile._id,
    languageId
  );

  Object.assign(language, updates);
  await language.save();

  return {
    message: "Language updated successfully",
    language: serializeLanguage(language)
  };
};

const deleteLanguage = async (userId, languageId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  await getLanguageByIdForProfileOrThrow(profile._id, languageId);
  await Language.findByIdAndDelete(languageId);

  return {
    message: "Language deleted successfully"
  };
};

module.exports = {
  listMyLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage
};
