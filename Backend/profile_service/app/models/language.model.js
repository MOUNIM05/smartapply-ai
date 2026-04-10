/**
 * Modele Mongoose - language.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Language =
  mongoose.models.Language || mongoose.model("Language", languageSchema);

module.exports = {
  Language
};

