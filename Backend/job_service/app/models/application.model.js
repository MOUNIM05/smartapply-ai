/**
 * Modele Mongoose - application.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOffer",
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "accepted", "rejected"],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

module.exports = {
  Application
};

