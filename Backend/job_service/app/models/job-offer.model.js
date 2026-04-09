const mongoose = require("mongoose");

const jobOfferSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      default: "",
      trim: true
    },
    location: {
      type: String,
      default: "",
      trim: true
    },
    employmentType: {
      type: String,
      default: "",
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    savedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

const JobOffer = mongoose.models.JobOffer || mongoose.model("JobOffer", jobOfferSchema);

module.exports = {
  JobOffer
};
