import mongoose, { Schema } from "mongoose";

const userBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
    unlockedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("UserBadge", userBadgeSchema);