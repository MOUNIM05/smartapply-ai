const {
  validateCreateLanguageRequest,
  validateUpdateLanguageRequest
} = require("../schemas/language.schema");
const {
  listMyLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage
} = require("../services/language.service");

const listMyLanguagesController = async (req, res, next) => {
  try {
    const result = await listMyLanguages(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createLanguageController = async (req, res, next) => {
  try {
    const payload = validateCreateLanguageRequest(req.body);
    const result = await createLanguage(req.user.userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateLanguageController = async (req, res, next) => {
  try {
    const updates = validateUpdateLanguageRequest(req.body);
    const result = await updateLanguage(req.user.userId, req.params.id, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteLanguageController = async (req, res, next) => {
  try {
    const result = await deleteLanguage(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyLanguagesController,
  createLanguageController,
  updateLanguageController,
  deleteLanguageController
};
