/**
 * Modele Mongoose - auth.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    subscription_plan: {
      type: String,
      enum: ["free", "student", "premium"],
      default: "free"
    },
    subscription_status: {
      type: String,
      enum: ["inactive", "active", "past_due", "canceled"],
      default: "inactive"
    },
    subscription_interval: {
      type: String,
      enum: ["monthly"],
      default: "monthly"
    },
    subscription_started_at: {
      type: Date,
      default: null
    },
    subscription_renewal_at: {
      type: Date,
      default: null
    },
    stripe_customer_id: {
      type: String,
      default: "",
      trim: true
    },
    stripe_subscription_id: {
      type: String,
      default: "",
      trim: true
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = {
  User
};

