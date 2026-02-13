/**
 * Central API router. Mounts feature routes under /api-v1 (see main index.js).
 * Each file defines its own sub-routes (e.g. /auth/login, /workspaces/:id).
 */
import express from "express";

import authRoutes from "./auth.js";
import chatRoutes from "./chat.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import taskRoutes from "./task.js";
import userRoutes from "./user.js";
import achievementRoutes from "./achievement.js";
import notificationRoutes from "./notification.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/achievements", achievementRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);

export default router;
