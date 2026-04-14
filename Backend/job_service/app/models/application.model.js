/**
 * Modele Mongoose - application.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const storedFileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    dataUrl: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

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
    },
    cvFile: {
      type: storedFileSchema,
      default: null
    },
    motivationLetterFile: {
      type: storedFileSchema,
      default: null
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

