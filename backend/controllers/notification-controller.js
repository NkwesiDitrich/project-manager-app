import Notification from "../models/notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "name profilePicture");

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNotification = async (recipient, sender, type, title, message, relatedId) => {
  try {
    await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId
    });
  } catch (error) {
    console.error("Notification Error:", error);
  }
};