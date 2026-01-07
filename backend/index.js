import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

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

// Improved DB connection with faster timeout and better error messaging
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // If it can't connect in 5 seconds, fail. 
      // This prevents the 30-second "hanging" you were experiencing.
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

const PORT = process.env.PORT || 5000;

// Routes
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});