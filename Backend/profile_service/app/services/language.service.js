/**
 * Couche service - language.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Language } = require("../models/language.model");
const { sendNotification } = require("./notification-client.service");
const { getOrCreateProfileByUserId } = require("./profile-bootstrap.service");

const serializeLanguage = (language) => ({
  id: language._id,
  profile_id: language.profile_id,
  name: language.name,
  level: language.level,
  createdAt: language.createdAt,
  updatedAt: language.updatedAt
});

const getProfileByUserIdOrThrow = async (userId) => {
  return getOrCreateProfileByUserId(userId);
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

  await sendNotification({
    userId: String(userId),
    title: "Langue ajoutee",
    message: `La langue ${language.name} a ete ajoutee a votre profil.`,
    type: "language",
    event: "language_created",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      languageId: String(language._id)
    }
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

  await sendNotification({
    userId: String(userId),
    title: "Langue mise a jour",
    message: `La langue ${language.name} a ete mise a jour.`,
    type: "language",
    event: "language_updated",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      languageId: String(language._id),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Language updated successfully",
    language: serializeLanguage(language)
  };
};

const deleteLanguage = async (userId, languageId) => {
  const profile = await getProfileByUserIdOrThrow(userId);
  const language = await getLanguageByIdForProfileOrThrow(profile._id, languageId);
  await Language.findByIdAndDelete(languageId);

  await sendNotification({
    userId: String(userId),
    title: "Langue supprimee",
    message: `La langue ${language.name} a ete supprimee de votre profil.`,
    type: "language",
    event: "language_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      languageId: String(language._id)
    }
  });

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

