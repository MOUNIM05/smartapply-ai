import "dotenv/config";
import mongoose from "mongoose";
import CVTemplate from "../models/cv-template.model.js";

const templates = [
  {
    name: "Modern Professional",
    style: "modern",
    layoutOptions: {
      columns: 2,
      accentColor: "#1f4b99",
      sections: ["summary", "experience", "education", "skills"]
    },
    previewUrl: "https://smartapply.local/templates/modern-professional"
  },
  {
    name: "Creative Designer",
    style: "creative",
    layoutOptions: {
      columns: 1,
      accentColor: "#d46a3a",
      sections: ["profile", "portfolio", "experience", "education"]
    },
    previewUrl: "https://smartapply.local/templates/creative-designer"
  },
  {
    name: "Technical Developer",
    style: "technical",
    layoutOptions: {
      columns: 2,
      accentColor: "#0f766e",
      sections: ["summary", "skills", "experience", "projects", "education"]
    },
    previewUrl: "https://smartapply.local/templates/technical-developer"
  }
];

const seedTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await CVTemplate.deleteMany({});
    console.log("Cleared existing templates");

    await CVTemplate.insertMany(templates);
    console.log("Seeded templates successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
};

seedTemplates();
