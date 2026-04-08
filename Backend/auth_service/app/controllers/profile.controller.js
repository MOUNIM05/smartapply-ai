const { validateCreateProfileRequest, validateUpdateProfileRequest } = require("../schemas/profile.schema");
const {
  createProfile,
  getCurrentProfile,
  getProfileById,
  listProfiles,
  updateCurrentProfile,
  deleteCurrentProfile
} = require("../services/profile.service");

const createProfileController = async (req, res, next) => {
  try {
    const payload = validateCreateProfileRequest(req.body);
    const result = await createProfile(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyProfileController = async (req, res, next) => {
  try {
    const result = await getCurrentProfile(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const listProfilesController = async (req, res, next) => {
  try {
    const result = await listProfiles();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProfileByIdController = async (req, res, next) => {
  try {
    const result = await getProfileById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateMyProfileController = async (req, res, next) => {
  try {
    const updates = validateUpdateProfileRequest(req.body);
    const result = await updateCurrentProfile(req.user.userId, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteMyProfileController = async (req, res, next) => {
  try {
    const result = await deleteCurrentProfile(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfileController,
  getMyProfileController,
  listProfilesController,
  getProfileByIdController,
  updateMyProfileController,
  deleteMyProfileController
};
