import { Center } from "../../models";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";

export const centerResolver = {
  Query: {
    centers: async (_: unknown, { city }: { city?: string }) => {
      const query: Record<string, unknown> = { isActive: true };

      if (city) {
        query.city = city;
      }

      return Center.find(query).sort({ name: 1 });
    },

    center: async (_: unknown, { id }: { id: string }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid center ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const center = await Center.findById(id);

      if (!center) {
        throw new GraphQLError("Center not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return center;
    },
  },

  Center: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },
};
