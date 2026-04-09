const express = require("express");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

const {
  createJobOfferController,
  listJobOffersController,
  getJobOfferByIdController,
  createApplicationController,
  listApplicationsController,
  getApplicationByIdController
} = require("../controllers/job.controller");

const router = express.Router();

router.post("/job-offers", verifyToken, createJobOfferController);
router.get("/job-offers", verifyToken, listJobOffersController);
router.get("/job-offers/:id", verifyToken, getJobOfferByIdController);

router.post("/applications", verifyToken, createApplicationController);
router.get("/applications", verifyToken, requireAdmin, listApplicationsController);
router.get("/applications/:id", verifyToken, requireAdmin, getApplicationByIdController);

module.exports = router;
