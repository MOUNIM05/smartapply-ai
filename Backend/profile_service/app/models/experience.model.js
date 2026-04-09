const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: String,
      default: "",
      trim: true
    },
    endDate: {
      type: String,
      default: "",
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    skills: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Experience =
  mongoose.models.Experience || mongoose.model("Experience", experienceSchema);

module.exports = {
  Experience
};
