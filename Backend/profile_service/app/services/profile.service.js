/**
 * Couche service - profile.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { User } = require("../models/user.model");
const { Profile } = require("../models/profile.model");
const { sendNotification } = require("./notification-client.service");
const { getOrCreateProfileByUserId } = require("./profile-bootstrap.service");

const serializeUser = (user) =>
  user
    ? {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        address: user.address,
        avatar_url: user.avatar_url,
        role: user.role
      }
    : null;

const serializeCvUpload = (cvUpload) => {
  if (!cvUpload || !cvUpload.contentBase64) {
    return null;
  }

  return {
    fileName: cvUpload.fileName,
    mimeType: cvUpload.mimeType,
    size: cvUpload.size,
    uploadedAt: cvUpload.uploadedAt,
    hasFile: true
  };
};

const serializeProfile = (profile) => ({
  id: profile._id,
  user_id: profile.user_id?._id || profile.user_id,
  professional_title: profile.professional_title,
  summary: profile.summary,
  phone: profile.phone,
  address: profile.address,
  linkedin_url: profile.linkedin_url,
  github_url: profile.github_url,
  portfolio_url: profile.portfolio_url,
  cv_upload: serializeCvUpload(profile.cv_upload),
  user: serializeUser(profile.user_id),
  created_at: profile.createdAt,
  updated_at: profile.updatedAt
});

const getProfileByUserIdOrThrow = async (userId) => {
  return getOrCreateProfileByUserId(userId);
};

const createProfile = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const existingProfile = await Profile.findOne({ user_id: userId });

  if (existingProfile) {
    const error = new Error("Profile already exists for this user");
    error.statusCode = 400;
    throw error;
  }

  const profile = await Profile.create({
    user_id: userId,
    ...payload
  });

  try {
    await User.findByIdAndUpdate(
      userId,
      { profile_id: profile._id },
      { new: false, runValidators: false }
    );
  } catch (error) {
    await Profile.findByIdAndDelete(profile._id);
    throw error;
  }

  await sendNotification({
    userId: String(userId),
    title: "Profil cree",
    message: "Votre profil a ete cree avec succes.",
    type: "profile",
    event: "profile_created",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id)
    }
  });

  return {
    message: "Profile created successfully",
    profile: serializeProfile(profile)
  };
};

const getCurrentProfile = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  return {
    profile: serializeProfile(profile)
  };
};

const getProfileById = async (profileId) => {
  const profile = await Profile.findById(profileId).populate(
    "user_id",
    "first_name last_name email role"
  );

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    profile: serializeProfile(profile)
  };
};

const listProfiles = async () => {
  const profiles = await Profile.find()
    .populate("user_id", "first_name last_name email role")
    .sort({ createdAt: -1 });

  return {
    profiles: profiles.map(serializeProfile)
  };
};

const updateCurrentProfile = async (userId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  Object.assign(profile, updates);
  await profile.save();

  await sendNotification({
    userId: String(userId),
    title: "Profil mis a jour",
    message: "Les informations de votre profil ont ete mises a jour.",
    type: "profile",
    event: "profile_updated",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Profile updated successfully",
    profile: serializeProfile(profile)
  };
};

const deleteCurrentProfile = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  await Profile.findByIdAndDelete(profile._id);
  await User.findByIdAndUpdate(
    userId,
    { profile_id: null },
    { new: false, runValidators: false }
  );

  await sendNotification({
    userId: String(userId),
    title: "Profil supprime",
    message: "Votre profil a ete supprime.",
    type: "profile",
    event: "profile_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id)
    }
  });

  return {
    message: "Profile deleted successfully"
  };
};

const upsertCurrentProfileCV = async (userId, cvPayload) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  profile.cv_upload = {
    fileName: cvPayload.fileName,
    mimeType: cvPayload.mimeType,
    size: cvPayload.size,
    contentBase64: cvPayload.contentBase64,
    uploadedAt: new Date()
  };
  await profile.save();

  await sendNotification({
    userId: String(userId),
    title: "CV enregistre",
    message: "Votre CV a ete enregistre et remplace l'ancien fichier.",
    type: "profile",
    event: "profile_cv_uploaded",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      fileName: cvPayload.fileName,
      mimeType: cvPayload.mimeType,
      size: cvPayload.size
    }
  });

  return {
    message: "CV uploaded successfully",
    cvUpload: serializeCvUpload(profile.cv_upload)
  };
};

const getCurrentProfileCV = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  return {
    cvUpload: serializeCvUpload(profile.cv_upload)
  };
};

const deleteCurrentProfileCV = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  if (!profile.cv_upload || !profile.cv_upload.contentBase64) {
    const error = new Error("No uploaded CV found");
    error.statusCode = 404;
    throw error;
  }

  profile.cv_upload = null;
  await profile.save();

  await sendNotification({
    userId: String(userId),
    title: "CV supprime",
    message: "Votre CV enregistre a ete supprime.",
    type: "profile",
    event: "profile_cv_deleted",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id)
    }
  });

  return {
    message: "CV deleted successfully"
  };
};

const createProfileByAdmin = async (userId, payload, actorUserId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const existingProfile = await Profile.findOne({ user_id: userId });

  if (existingProfile) {
    const error = new Error("Profile already exists for this user");
    error.statusCode = 400;
    throw error;
  }

  const profile = await Profile.create({
    user_id: userId,
    ...payload
  });

  await User.findByIdAndUpdate(
    userId,
    { profile_id: profile._id },
    { new: false, runValidators: false }
  );

  const populatedProfile = await Profile.findById(profile._id).populate(
    "user_id",
    "first_name last_name email role"
  );

  await sendNotification({
    userId: String(userId),
    title: "Profil cree",
    message: "Un administrateur a cree votre profil.",
    type: "profile",
    event: "profile_created_by_admin",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      actorUserId: String(actorUserId)
    }
  });

  return {
    message: "Profile created successfully",
    profile: serializeProfile(populatedProfile)
  };
};

const updateProfileById = async (profileId, updates, actorUserId) => {
  const profile = await Profile.findById(profileId).populate(
    "user_id",
    "first_name last_name email role"
  );

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(profile, updates);
  await profile.save();

  await sendNotification({
    userId: String(profile.user_id?._id || profile.user_id),
    title: "Profil mis a jour",
    message: "Un administrateur a mis a jour votre profil.",
    type: "profile",
    event: "profile_updated_by_admin",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      actorUserId: String(actorUserId),
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Profile updated successfully",
    profile: serializeProfile(profile)
  };
};

const deleteProfileById = async (profileId, actorUserId) => {
  const profile = await Profile.findById(profileId);

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  await Profile.findByIdAndDelete(profileId);
  await User.findByIdAndUpdate(
    profile.user_id,
    { profile_id: null },
    { new: false, runValidators: false }
  );

  await sendNotification({
    userId: String(profile.user_id),
    title: "Profil supprime",
    message: "Un administrateur a supprime votre profil.",
    type: "profile",
    event: "profile_deleted_by_admin",
    sourceService: "profile-service",
    metadata: {
      profileId: String(profile._id),
      actorUserId: String(actorUserId)
    }
  });

  return {
    message: "Profile deleted successfully"
  };
};

module.exports = {
  createProfile,
  getCurrentProfile,
  getProfileById,
  listProfiles,
  updateCurrentProfile,
  deleteCurrentProfile,
  upsertCurrentProfileCV,
  getCurrentProfileCV,
  deleteCurrentProfileCV,
  createProfileByAdmin,
  updateProfileById,
  deleteProfileById
};

