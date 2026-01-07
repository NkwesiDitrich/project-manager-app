import User from "../models/user.js";
import Badge from "../models/badge.js";
import UserBadge from "../models/user-badge.js";
import Workspace from "../models/workspace.js";

export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workspaceId } = req.query;

    const user = await User.findById(userId);
    const userBadges = await UserBadge.find({ user: userId }).populate("badge");

    let leaderboard = [];
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        const memberIds = workspace.members.map(m => m.user);
        leaderboard = await User.find({ _id: { $in: memberIds } })
          .sort({ xp: -1 })
          .limit(10)
          .select("name profilePicture xp level");
      }
    }

    const allBadges = await Badge.find();

    res.status(200).json({
      userStats: { 
        xp: user.xp, 
        points: user.points, 
        level: user.level, 
        streak: user.streak, 
        badges: userBadges 
      },
      leaderboard,
      allBadges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const seedBadges = async (req, res) => {
  try {
    const badges = [
      {
        name: "Task Master",
        description: "Complete 50 tasks",
        icon: "Trophy",
        category: "Productivity",
        tier: "Bronze",
        criteria: { type: "tasks_completed", value: 50 },
        xpReward: 500,
        pointsReward: 100
      },
      {
        name: "Task Grandmaster",
        description: "Complete 100 tasks",
        icon: "Crown",
        category: "Productivity",
        tier: "Silver",
        criteria: { type: "tasks_completed", value: 100 },
        xpReward: 1000,
        pointsReward: 250
      }
    ];

    for (const b of badges) {
      await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true });
    }

    res.status(200).json({ message: "Badges seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error seeding badges" });
  }
};