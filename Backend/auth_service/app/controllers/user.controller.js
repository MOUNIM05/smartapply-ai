const { validateUpdateMeRequest, validateCreateUserRequest, validateAdminUpdateUserRequest } = require("../schemas/user.schema");
const {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  listUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
} = require("../services/user.service");

const getMeController = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateMeController = async (req, res, next) => {
  try {
    const updates = validateUpdateMeRequest(req.body);
    const result = await updateCurrentUser(req.user.userId, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteMeController = async (req, res, next) => {
  try {
    const result = await deleteCurrentUser(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const listUsersController = async (req, res, next) => {
  try {
    const result = await listUsers();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getUserByIdController = async (req, res, next) => {
  try {
    const result = await getUserById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createUserController = async (req, res, next) => {
  try {
    const payload = validateCreateUserRequest(req.body);
    const result = await createUserByAdmin(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserByIdController = async (req, res, next) => {
  try {
    const updates = validateAdminUpdateUserRequest(req.body);
    const result = await updateUserByAdmin(req.params.id, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteUserByIdController = async (req, res, next) => {
  try {
    const result = await deleteUserByAdmin(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeController,
  updateMeController,
  deleteMeController,
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserByIdController,
  deleteUserByIdController
};
