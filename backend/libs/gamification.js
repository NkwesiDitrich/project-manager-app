import User from "../models/user.js";
import Badge from "../models/badge.js";
import UserBadge from "../models/user-badge.js";
import Task from "../models/task.js";

export const updateGamification = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 1. Calculate Task Completion Stats
    const completedTasksCount = await Task.countDocuments({
      assignees: userId,
      status: "Done"
    });

    // 2. Update XP and Level (10 XP per task)
    const newXp = completedTasksCount * 10;
    user.xp = newXp;
    user.level = Math.floor(newXp / 100) + 1;
    
    // 3. Check for Badges
    const allBadges = await Badge.find();
    const userBadges = await UserBadge.find({ user: userId });
    const userBadgeIds = userBadges.map(ub => ub.badge.toString());

    for (const badge of allBadges) {
      if (userBadgeIds.includes(badge._id.toString())) continue;

      if (badge.criteria.type === "tasks_completed" && completedTasksCount >= badge.criteria.value) {
        await UserBadge.create({ user: userId, badge: badge._id });
        user.points += badge.pointsReward;
        user.xp += badge.xpReward;
      }
    }

    await user.save();
  } catch (error) {
    console.error("Gamification Error:", error);
  }
};