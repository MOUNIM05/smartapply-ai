const mongoose = require("mongoose");

const aiModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    provider: {
      type: String,
      required: true,
      trim: true
    },
    version: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const AIModel = mongoose.model("AIModel", aiModelSchema);

module.exports = {
  AIModel
};
