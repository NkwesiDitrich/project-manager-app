import User from "../models/user.js";
import Badge from "../models/badge.js";
import UserBadge from "../models/user-badge.js";
import Task from "../models/task.js";

/**
 * Updates user streak based on task completion
 * If task completed today and last completion was yesterday, increment streak
 * If task completed today and last completion was today, keep streak
 * If gap > 1 day, reset streak to 1
 */
const updateStreak = async (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!user.lastTaskCompletedAt) {
    // First task completion
    user.streak = 1;
    user.lastTaskCompletedAt = now;
    return;
  }

  const lastCompletion = new Date(user.lastTaskCompletedAt);
  const lastCompletionDate = new Date(
    lastCompletion.getFullYear(),
    lastCompletion.getMonth(),
    lastCompletion.getDate()
  );

  const daysDiff = Math.floor((today - lastCompletionDate) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Task completed same day, keep streak
    return;
  } else if (daysDiff === 1) {
    // Task completed next day, increment streak
    user.streak += 1;
  } else {
    // Gap > 1 day, reset streak
    user.streak = 1;
  }

  user.lastTaskCompletedAt = now;
};

/**
 * Evaluates and awards badges based on user achievements
 * Checks: task_count, streak, level criteria
 */
const evaluateBadges = async (user, completedTasksCount) => {
  try {
    const allBadges = await Badge.find();
    const userBadges = await UserBadge.find({ user: user._id });
    const userBadgeIds = new Set(userBadges.map(ub => ub.badge.toString()));

    const newlyAwardedBadges = [];

    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (userBadgeIds.has(badge._id.toString())) {
        continue;
      }

      let criteriaMet = false;

      // Check badge criteria based on type
      switch (badge.criteria.type) {
        case "tasks_completed":
        case "task_count":
          criteriaMet = completedTasksCount >= badge.criteria.value;
          break;

        case "streak":
          criteriaMet = user.streak >= badge.criteria.value;
          break;

        case "level":
          criteriaMet = user.level >= badge.criteria.value;
          break;

        default:
          // Support legacy format
          if (badge.criteria.type === "tasks_completed") {
            criteriaMet = completedTasksCount >= badge.criteria.value;
          }
          break;
      }

      if (criteriaMet) {
        try {
          // Create UserBadge record (unique index prevents duplicates)
          await UserBadge.create({
            user: user._id,
            badge: badge._id,
            unlockedAt: new Date()
          });

          // Award XP and points bonus
          user.xp += badge.xpReward || 0;
          user.points += badge.pointsReward || 0;

          newlyAwardedBadges.push(badge);
        } catch (error) {
          // Ignore duplicate key errors (badge already awarded)
          if (error.code !== 11000) {
            console.error(`Error awarding badge ${badge.name}:`, error);
          }
        }
      }
    }

    return newlyAwardedBadges;
  } catch (error) {
    console.error("Badge evaluation error:", error);
    return [];
  }
};

/**
 * Main gamification update function
 * Called when a task is completed
 * @param {string} userId - User ID
 * @param {boolean} updateStreakFlag - Whether to update streak (only true when task is newly completed)
 */
export const updateGamification = async (userId, updateStreakFlag = false) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // 1. Calculate Task Completion Stats
    const completedTasksCount = await Task.countDocuments({
      assignees: userId,
      status: "Done"
    });

    // 2. Update XP and Level (10 XP per task)
    const newXp = completedTasksCount * 10;
    user.xp = newXp;
    user.level = Math.floor(newXp / 100) + 1;

    // 3. Update Streak (only when a task is newly completed)
    if (updateStreakFlag) {
      await updateStreak(user);
    }

    // 4. Evaluate and Award Badges
    const newlyAwardedBadges = await evaluateBadges(user, completedTasksCount);

    // 5. Save user updates
    await user.save();

    return {
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      points: user.points,
      newlyAwardedBadges
    };
  } catch (error) {
    console.error("Gamification Error:", error);
    return null;
  }
};