import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import { recordActivity } from "../libs/index.js";
import { createNotification } from "./notification-controller.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    // Log activity (non-blocking)
    recordActivity(req.user._id, "created_project", "Project", newProject._id, {
      description: `created project "${title}"`,
    }).catch((err) => console.error("Activity logging error:", err));

    // Send notifications to workspace members (non-blocking)
    // Notify all workspace members except the creator
    const workspaceMembers = workspace.members
      .map((member) => member.user.toString())
      .filter((memberId) => memberId !== req.user._id.toString());

    if (workspaceMembers.length > 0) {
      const notificationPromises = workspaceMembers.map((memberId) =>
        createNotification(
          memberId,
          req.user._id,
          "project_added",
          "New Project Created",
          `A new project "${title}" has been created in workspace "${workspace.name}"`,
          newProject._id
        )
      );
      Promise.all(notificationPromises).catch((err) =>
        console.error("Notification error:", err)
      );
    }

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const workspace = await Workspace.findById(project.workspace).populate(
      "members.user",
      "name email profilePicture"
    );

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
      workspaceMembers: workspace ? workspace.members : [] // Send members to frontend
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails, getProjectTasks };
