const { Profile } = require("../models/profile.model");

const DEFAULT_PROFILE_VALUES = {
  professional_title: "New Candidate",
  summary: "",
  phone: "",
  address: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: ""
};

const getOrCreateProfileByUserId = async (userId) => {
  let profile = await Profile.findOne({ user_id: userId });

  if (profile) {
    return profile;
  }

  profile = await Profile.create({
    user_id: userId,
    ...DEFAULT_PROFILE_VALUES
  });

  return profile;
};

module.exports = {
  getOrCreateProfileByUserId
};
