// Starts the document service HTTP server.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env")
});

const PORT = process.env.PORT || 5002;

const requiredEnvVars = ["MONGO_URI"];
const missingEnvVars = requiredEnvVars.filter((variableName) => !process.env[variableName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start document service:", error.message);
    process.exit(1);
  }
};

startServer();
