/**
 * Tasco API – Express entry point.
 * Serves REST API under /api-v1, connects to MongoDB, and allows CORS from the frontend origin.
 */
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

// CORS: allow requests from the frontend URL (set in FRONTEND_URL)
// If FRONTEND_URL is not set, allow all origins (for development/testing)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true, // Allow all origins if FRONTEND_URL not set
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Serve uploaded files (e.g. chat images) from the uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/api-v1/uploads", express.static(uploadsDir));

// Connect to MongoDB; required for all data operations
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ DB Connected successfully.");
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err.message);
    console.error(
      "💡 TIP: This is usually caused by your IP address not being whitelisted in MongoDB Atlas."
    );
    console.error("Check your Network Access settings at: https://cloud.mongodb.com/");
  }
};
connectDB();

const PORT = process.env.PORT || 3001;
// Bind to 0.0.0.0 when PORT is set (e.g. on Render) so the server is reachable from outside
const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

// Health/welcome route at root; all app routes live under /api-v1
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Welcome to Tasco API" });
});
app.use("/api-v1", routes);

// Global error handler and 404
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});