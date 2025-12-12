import mongoose, { Document, Schema } from "mongoose";

export interface IGoal extends Document {
  patientId: mongoose.Types.ObjectId;
  name: string;
  duration: string;
  type: string;
  progress: number;
  priority: "high" | "medium" | "low";
  status: "active" | "completed";
  current?: number;
  target?: number;
  unit?: string;
  latestAchievement?: string;
  targetDate?: Date;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      minlength: [1, "Goal name cannot be empty"],
      maxlength: [200, "Goal name cannot exceed 200 characters"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    type: {
      type: String,
      required: [true, "Goal type is required"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    priority: {
      type: String,
      enum: {
        values: ["high", "medium", "low"],
        message: "Priority must be high, medium, or low",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed"],
        message: "Status must be active or completed",
      },
      default: "active",
    },
    current: {
      type: Number,
      min: [0, "Current value cannot be negative"],
    },
    target: {
      type: Number,
      min: [0, "Target value cannot be negative"],
    },
    unit: {
      type: String,
      trim: true,
    },
    latestAchievement: {
      type: String,
      trim: true,
    },
    targetDate: Date,
    lastUpdated: Date,
  },
  { timestamps: true }
);

// Indexes for faster queries
goalSchema.index({ patientId: 1, status: 1 });
goalSchema.index({ patientId: 1, createdAt: -1 });

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);
