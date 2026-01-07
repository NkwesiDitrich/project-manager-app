import mongoose, { Schema } from "mongoose";

const badgeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Lucide icon name
    category: { 
      type: String, 
      enum: ["Productivity", "Milestone", "Collaboration", "Innovation"],
      required: true 
    },
    tier: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" },
    criteria: {
      type: { type: String, required: true }, // e.g., "tasks_completed"
      value: { type: Number, required: true } // e.g., 50
    },
    xpReward: { type: Number, default: 100 },
    pointsReward: { type: Number, default: 50 }
  },
  { timestamps: true }
);

export default mongoose.model("Badge", badgeSchema);