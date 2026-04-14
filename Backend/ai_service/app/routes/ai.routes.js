// Registers Ai.routes routes for the Ai service.
const express = require("express");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");
const {
  createAIModelController,
  listAIModelsController,
  getAIModelByIdController,
  createAIGenerationRequestController,
  listAIGenerationRequestsController,
  getAIGenerationRequestByIdController,
  createAIGenerationResponseController,
  listAIGenerationResponsesController,
  getAIGenerationResponseByIdController
} = require("../controllers/ai.controller");

const router = express.Router();

router.get("/ai-models", verifyToken, listAIModelsController);
router.post("/ai-models", verifyToken, requireAdmin, createAIModelController);
router.get("/ai-models/:id", verifyToken, getAIModelByIdController);

router.post("/ai-requests", verifyToken, createAIGenerationRequestController);
router.get("/ai-requests", verifyToken, listAIGenerationRequestsController);
router.get("/ai-requests/:id", verifyToken, getAIGenerationRequestByIdController);

router.post("/ai-responses", verifyToken, requireAdmin, createAIGenerationResponseController);
router.get("/ai-responses", verifyToken, listAIGenerationResponsesController);
router.get("/ai-responses/:id", verifyToken, getAIGenerationResponseByIdController);

module.exports = router;
