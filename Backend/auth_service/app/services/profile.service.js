const { User } = require("../models/auth.model");
const { Profile } = require("../models/profile.model");

const serializeProfile = (profile) => ({
  id: profile._id,
  user_id: profile.user_id,
  professional_title: profile.professional_title,
  summary: profile.summary,
  phone: profile.phone,
  address: profile.address,
  linkedin_url: profile.linkedin_url,
  github_url: profile.github_url,
  portfolio_url: profile.portfolio_url,
  created_at: profile.createdAt,
  updated_at: profile.updatedAt
});

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

  return {
    message: "Profile created successfully",
    profile: serializeProfile(profile)
  };
};

const getProfileByUserIdOrThrow = async (userId) => {
  const profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

const getCurrentProfile = async (userId) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  return {
    profile: serializeProfile(profile)
  };
};

const getProfileById = async (profileId) => {
  const profile = await Profile.findById(profileId);

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
  const profiles = await Profile.find().sort({ createdAt: -1 });

  return {
    profiles: profiles.map(serializeProfile)
  };
};

const updateCurrentProfile = async (userId, updates) => {
  const profile = await getProfileByUserIdOrThrow(userId);

  Object.assign(profile, updates);
  await profile.save();

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
  deleteCurrentProfile
};
