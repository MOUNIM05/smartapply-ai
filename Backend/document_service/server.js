import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port 5002");
    });
  } catch (error) {
    console.error("Failed to start document service:", error.message);
    process.exit(1);
  }
};

startServer();