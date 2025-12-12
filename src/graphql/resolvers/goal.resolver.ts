import { Goal } from "../../models";
import { requireAuth, AuthContext } from "../../middleware/auth.middleware";
import { GraphQLError } from "graphql";
import {
  createGoalSchema,
  updateGoalSchema,
} from "../../validators/goal.validator";
import mongoose from "mongoose";

export const goalResolver = {
  Query: {
    goals: async (
      _: unknown,
      { status }: { status?: "active" | "completed" },
      context: AuthContext
    ) => {
      const user = requireAuth(context);
      const query: Record<string, unknown> = { patientId: user.id };

      if (status) {
        query.status = status;
      }

      return Goal.find(query).sort({ createdAt: -1 });
    },

    goal: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid goal ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const goal = await Goal.findOne({ _id: id, patientId: user.id });

      if (!goal) {
        throw new GraphQLError("Goal not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return goal;
    },
  },

  Mutation: {
    createGoal: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);
      createGoalSchema.parse(input);

      const goalData: Record<string, unknown> = {
        patientId: user.id,
        name: input.name,
        duration: input.duration,
        type: input.type,
        priority: input.priority,
        progress: 0,
        status: "active",
        lastUpdated: new Date(),
      };

      if (input.target !== undefined) {
        goalData.target = input.target;
      }

      if (input.unit) {
        goalData.unit = input.unit;
      }

      if (input.targetDate) {
        goalData.targetDate = new Date(input.targetDate as string);
      }

      const goal = await Goal.create(goalData);
      return goal;
    },

    updateGoal: async (
      _: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid goal ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      updateGoalSchema.parse(input);

      const updateData: Record<string, unknown> = {
        ...input,
        lastUpdated: new Date(),
      };

      const goal = await Goal.findOneAndUpdate(
        { _id: id, patientId: user.id },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!goal) {
        throw new GraphQLError("Goal not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return goal;
    },

    deleteGoal: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid goal ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const result = await Goal.deleteOne({ _id: id, patientId: user.id });

      if (result.deletedCount === 0) {
        throw new GraphQLError("Goal not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return result.deletedCount > 0;
    },
  },

  Goal: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    patientId: (parent: { patientId: mongoose.Types.ObjectId | string }) =>
      typeof parent.patientId === "string"
        ? parent.patientId
        : parent.patientId.toString(),
    targetDate: (parent: { targetDate?: Date }) => {
      return parent.targetDate ? parent.targetDate.toISOString() : null;
    },
    lastUpdated: (parent: { lastUpdated?: Date }) => {
      return parent.lastUpdated ? parent.lastUpdated.toISOString() : null;
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },
};
