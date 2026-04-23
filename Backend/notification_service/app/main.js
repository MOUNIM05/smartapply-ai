// Bootstraps the Notification service, middleware stack, and routes.
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDatabase = require("./config/database");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const PORT = process.env.PORT || 5005;

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((variableName) => !process.env[variableName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Notification service is running"
  });
});

app.use(notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start notification service:", error.message);
    process.exit(1);
  }
};

startServer();
