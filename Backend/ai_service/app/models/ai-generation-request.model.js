const mongoose = require("mongoose");

const aiGenerationRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    aiModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIModel",
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    contextData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    requestType: {
      type: String,
      required: true,
      enum: ["cv_generation", "motivation_letter", "application_email", "job_adaptation", "other"]
    }
  },
  {
    timestamps: true
  }
);

const AIGenerationRequest = mongoose.model("AIGenerationRequest", aiGenerationRequestSchema);

module.exports = {
  AIGenerationRequest
};
