import { Consultant, Center } from "../../models";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";

export const consultantResolver = {
  Query: {
    consultants: async (
      _: unknown,
      { centerId, specialty }: { centerId?: string; specialty?: string }
    ) => {
      const query: Record<string, unknown> = { isActive: true };

      if (centerId) {
        if (!mongoose.Types.ObjectId.isValid(centerId)) {
          throw new GraphQLError("Invalid center ID", {
            extensions: { code: "INVALID_INPUT" },
          });
        }
        query.centerId = centerId;
      }

      if (specialty) {
        query.specialty = specialty;
      }

      return Consultant.find(query).sort({ name: 1 });
    },

    consultant: async (_: unknown, { id }: { id: string }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid consultant ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const consultant = await Consultant.findById(id);

      if (!consultant) {
        throw new GraphQLError("Consultant not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return consultant;
    },
  },

  Consultant: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    centerId: (parent: { centerId: mongoose.Types.ObjectId | string }) => {
      return typeof parent.centerId === "string"
        ? parent.centerId
        : parent.centerId.toString();
    },
    center: async (parent: { centerId: mongoose.Types.ObjectId }) => {
      return Center.findById(parent.centerId);
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },
};
