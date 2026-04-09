require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDatabase = require("./config/database");
const aiRoutes = require("./routes/ai.routes");

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI service is running"
  });
});

app.use(aiRoutes);

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
      console.log(`AI service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start AI service:", error.message);
    process.exit(1);
  }
};

startServer();
