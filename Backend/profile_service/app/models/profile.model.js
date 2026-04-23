/**
 * Modele Mongoose - profile.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const cvUploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      default: "",
      trim: true
    },
    mimeType: {
      type: String,
      default: "",
      trim: true
    },
    size: {
      type: Number,
      default: 0
    },
    contentBase64: {
      type: String,
      default: ""
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    professional_title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: "",
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    linkedin_url: {
      type: String,
      default: "",
      trim: true
    },
    github_url: {
      type: String,
      default: "",
      trim: true
    },
    portfolio_url: {
      type: String,
      default: "",
      trim: true
    },
    cv_upload: {
      type: cvUploadSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);

module.exports = {
  Profile
};

