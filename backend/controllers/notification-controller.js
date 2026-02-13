import Notification from "../models/notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "name profilePicture");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Creates a notification for a user
 * This function is non-blocking and handles errors silently to avoid disrupting main operations
 * @param {string} recipient - User ID of the recipient
 * @param {string} sender - User ID of the sender
 * @param {string} type - Notification type (task_assigned, task_completed, workspace_invite, project_added)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} relatedId - Related resource ID (optional)
 */
export const createNotification = async (recipient, sender, type, title, message, relatedId) => {
  try {
    // Don't send notification to self
    if (recipient.toString() === sender.toString()) {
      return;
    }

    await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId,
    });
  } catch (error) {
    // Log error but don't throw - notifications shouldn't break main operations
    console.error("Notification Error:", error);
  }
};

/**
 * Creates multiple notifications efficiently
 * Used for bulk operations like assigning multiple users to a task
 */
export const createNotifications = async (notifications) => {
  try {
    if (!notifications || notifications.length === 0) {
      return;
    }

    // Filter out self-notifications
    const validNotifications = notifications.filter(
      (notif) => notif.recipient.toString() !== notif.sender.toString()
    );

    if (validNotifications.length === 0) {
      return;
    }

    await Notification.insertMany(validNotifications);
  } catch (error) {
    console.error("Bulk Notification Error:", error);
  }
};