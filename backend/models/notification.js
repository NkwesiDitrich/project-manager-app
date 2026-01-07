import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["task_assigned", "task_completed", "workspace_invite", "project_added"],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);