/**
 * Modele Mongoose - profile.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

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

