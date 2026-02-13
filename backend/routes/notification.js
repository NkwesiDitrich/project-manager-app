import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification-controller.js";

const router = express.Router();

// Get user's notifications
router.get("/", authenticateUser, getNotifications);

// Mark a single notification as read
router.put("/:notificationId/read", authenticateUser, markAsRead);

// Mark all notifications as read
router.put("/read-all", authenticateUser, markAllAsRead);

export default router;
