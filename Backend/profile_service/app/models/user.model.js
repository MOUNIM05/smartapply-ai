/**
 * Modele Mongoose - user.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true
    },
    last_name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    avatar_url: {
      type: String,
      default: "",
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = {
  User
};

