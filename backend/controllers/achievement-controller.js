import User from "../models/user.js";
import Badge from "../models/badge.js";
import UserBadge from "../models/user-badge.js";
import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workspaceId } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Badges remain global for now (earned across all workspaces)
    const userBadges = await UserBadge.find({ user: userId }).populate("badge");

    let allBadges = await Badge.find();

    // Default user stats (global, used when no workspace is specified)
    let userStats = {
      xp: user.xp,
      points: user.points,
      level: user.level,
      streak: user.streak,
      badges: userBadges,
    };

    let leaderboard = [];

    // If a workspaceId is provided, compute XP/level/leaderboard ONLY from that workspace
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);

      if (workspace) {
        // All projects in this workspace
        const projects = await Project.find({ workspace: workspaceId }).select("_id");
        const projectIds = projects.map((p) => p._id);

        // 1) Workspace-specific stats for the current user
        const completedTasksCountForUser = await Task.countDocuments({
          assignees: userId,
          status: "Done",
          project: { $in: projectIds },
        });

        const workspaceXp = completedTasksCountForUser * 10;
        const workspaceLevel = Math.floor(workspaceXp / 100) + 1;

        userStats = {
          xp: workspaceXp,
          points: user.points, // still global points
          level: workspaceLevel,
          streak: user.streak, // streak is still global
          badges: userBadges,
        };

        // 2) Workspace-specific leaderboard
        const memberIds = workspace.members.map((m) => m.user);
        const members = await User.find({ _id: { $in: memberIds } }).select(
          "name profilePicture"
        );

        const leaderboardWithXp = await Promise.all(
          members.map(async (member) => {
            const completedTasksForMember = await Task.countDocuments({
              assignees: member._id,
              status: "Done",
              project: { $in: projectIds },
            });

            const memberXp = completedTasksForMember * 10;
            const memberLevel = Math.floor(memberXp / 100) + 1;

            return {
              _id: member._id,
              name: member.name,
              profilePicture: member.profilePicture,
              xp: memberXp,
              level: memberLevel,
            };
          })
        );

        leaderboard = leaderboardWithXp
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10);
      }
    }

    res.status(200).json({
      userStats,
      leaderboard,
      allBadges,
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
        name: "Task Beginner",
        description: "Complete 5 tasks",
        icon: "CheckCircle",
        category: "Productivity",
        tier: "Bronze",
        criteria: { type: "task_count", value: 5 },
        xpReward: 50,
        pointsReward: 25
      },
      {
        name: "Task Master",
        description: "Complete 20 tasks",
        icon: "Trophy",
        category: "Productivity",
        tier: "Silver",
        criteria: { type: "task_count", value: 20 },
        xpReward: 200,
        pointsReward: 100
      },
      {
        name: "Streak King",
        description: "Maintain a 7-day task completion streak",
        icon: "Flame",
        category: "Productivity",
        tier: "Gold",
        criteria: { type: "streak", value: 7 },
        xpReward: 300,
        pointsReward: 150
      },
      {
        name: "Task Grandmaster",
        description: "Complete 100 tasks",
        icon: "Crown",
        category: "Productivity",
        tier: "Gold",
        criteria: { type: "task_count", value: 100 },
        xpReward: 1000,
        pointsReward: 250
      }
    ];

    for (const b of badges) {
      await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true });
    }

    res.status(200).json({ message: "Badges seeded successfully" });
  } catch (error) {
    console.error("Error seeding badges:", error);
    res.status(500).json({ message: "Error seeding badges" });
  }
};