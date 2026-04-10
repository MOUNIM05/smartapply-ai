/**
 * Modele Mongoose - ai-generation-response.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const aiGenerationResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIGenerationRequest",
      required: true,
      unique: true
    },
    rawOutput: {
      type: String,
      required: true,
      trim: true
    },
    structuredOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const AIGenerationResponse = mongoose.model("AIGenerationResponse", aiGenerationResponseSchema);

module.exports = {
  AIGenerationResponse
};

