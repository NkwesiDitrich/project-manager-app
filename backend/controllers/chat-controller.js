import ChatMessage from "../models/chat-message.js";
import Workspace from "../models/workspace.js";

// Get latest messages for a workspace (with simple pagination)
export const getWorkspaceMessages = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 50, before } = req.query;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    const query = { workspace: workspaceId };
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await ChatMessage.find(query)
      .populate("sender", "_id name profilePicture")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Return in chronological order on the client
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new text / image message
export const createWorkspaceMessage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { text } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    let imageUrl = null;
    if (req.file) {
      // Expose uploads as static under /api-v1/uploads
      imageUrl = `/api-v1/uploads/${req.file.filename}`;
    }

    if (!text && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Message must contain text or an image" });
    }

    const message = await ChatMessage.create({
      workspace: workspaceId,
      sender: req.user._id,
      text,
      imageUrl,
    });

    const populated = await message.populate("sender", "_id name profilePicture");

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a message (only by sender)
export const updateWorkspaceMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    if (text !== undefined) message.text = text.trim();
    if (!message.text && !message.imageUrl) {
      return res.status(400).json({ message: "Message must contain text or an image" });
    }

    await message.save();
    const populated = await ChatMessage.findById(messageId).populate("sender", "_id name profilePicture");
    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a message (only by sender)
export const deleteWorkspaceMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await ChatMessage.deleteOne({ _id: messageId });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
