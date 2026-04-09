const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    school: {
      type: String,
      required: true,
      trim: true
    },
    period: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Education =
  mongoose.models.Education || mongoose.model("Education", educationSchema);

module.exports = {
  Education
};
