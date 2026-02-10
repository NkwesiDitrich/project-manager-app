import mongoose, { Schema } from "mongoose";

const userBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
    unlockedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent duplicate badge awards - ensure one user can only earn a badge once
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export default mongoose.model("UserBadge", userBadgeSchema);