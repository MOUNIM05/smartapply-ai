// Provides the Seed admin script for the Auth service.
require("dotenv").config();

const connectDatabase = require("../config/database");
const { User } = require("../models/auth.model");
const { hashPassword } = require("../services/auth.service");

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const email = "admin@gmail.com";
    const plainPassword = "admin123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(plainPassword);

    await User.create({
      first_name: "Admin",
      last_name: "System",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
