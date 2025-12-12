import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name cannot be empty").max(200),
  duration: z.string().min(1, "Duration is required"),
  type: z.string().min(1, "Goal type is required"),
  priority: z.enum(["high", "medium", "low"], {
    message: "Priority must be high, medium, or low",
  }),
  target: z.number().min(0).optional(),
  unit: z.string().optional(),
  targetDate: z.string().optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  progress: z.number().min(0).max(100).optional(),
  current: z.number().min(0).optional(),
  target: z.number().min(0).optional(),
  latestAchievement: z.string().optional(),
  status: z.enum(["active", "completed"]).optional(),
});
