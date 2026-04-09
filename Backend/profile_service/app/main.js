require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDatabase = require("./config/database");
const profileRoutes = require("./routes/profile.routes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Profile service is running"
  });
});

app.use(profileRoutes);

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
      console.log(`Profile service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start profile service:", error.message);
    process.exit(1);
  }
};

startServer();
