const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

const Skill = mongoose.models.Skill || mongoose.model("Skill", skillSchema);

module.exports = {
  Skill
};
