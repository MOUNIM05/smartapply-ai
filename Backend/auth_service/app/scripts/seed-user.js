// Provides the Seed user script for the Auth service.
require("dotenv").config();

const connectDatabase = require("../config/database");
const { User } = require("../models/auth.model");
const { hashPassword } = require("../services/auth.service");

const seedUser = async () => {
  try {
    await connectDatabase();

    const email = "test@gmail.com";
    const plainPassword = "123456";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Test user already exists:", email);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(plainPassword);

    await User.create({
      first_name: "Test",
      last_name: "User",
      email,
      password: hashedPassword,
      role: "user"
    });

    console.log("Test user created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed user:", error.message);
    process.exit(1);
  }
};

seedUser();
