// Creates the document service app instance and shared middleware.
import express from "express";
import cors from "cors";
import morgan from "morgan";
import documentRoutes from "./routes/document.routes.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Document service is running"
  });
});

app.use(documentRoutes);

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

export default app;