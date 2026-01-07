import express from "express";
import { getAchievements, seedBadges } from "../controllers/achievement-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAchievements);
router.post("/seed", authMiddleware, seedBadges);

export default router;