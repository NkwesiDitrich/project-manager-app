import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authMiddleware from "../middleware/auth-middleware.js";
import {
  createWorkspaceMessage,
  deleteWorkspaceMessage,
  getWorkspaceMessages,
  updateWorkspaceMessage,
} from "../controllers/chat-controller.js";

const router = express.Router();

// Setup multer storage for chat images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// Get messages for a workspace
router.get(
  "/workspaces/:workspaceId/messages",
  authMiddleware,
  getWorkspaceMessages
);

// Send a message (text and optional image)
router.post(
  "/workspaces/:workspaceId/messages",
  authMiddleware,
  upload.single("image"),
  createWorkspaceMessage
);

// Edit a message (only sender)
router.put(
  "/workspaces/:workspaceId/messages/:messageId",
  authMiddleware,
  updateWorkspaceMessage
);

// Delete a message (only sender)
router.delete(
  "/workspaces/:workspaceId/messages/:messageId",
  authMiddleware,
  deleteWorkspaceMessage
);

export default router;

