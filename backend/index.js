import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Static files for chat uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Create uploads directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  "/api-v1/uploads",
  express.static(uploadsDir)
);

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
const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

// Routes
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to Tasco API",
  });
});

app.use("/api-v1", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});