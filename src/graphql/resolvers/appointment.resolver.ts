import { Appointment, Consultant, Center } from "../../models";
import { requireAuth, AuthContext } from "../../middleware/auth.middleware";
import { GraphQLError } from "graphql";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../../validators/appointment.validator";
import mongoose from "mongoose";

export const appointmentResolver = {
  Query: {
    appointments: async (
      _: unknown,
      { status }: { status?: "booked" | "completed" | "cancelled" },
      context: AuthContext
    ) => {
      const user = requireAuth(context);
      const query: Record<string, unknown> = { patientId: user.id };

      if (status) {
        query.status = status;
      }

      return Appointment.find(query)
        .sort({ date: -1, time: -1 })
        .populate("consultantId")
        .populate("centerId");
    },

    appointment: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid appointment ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const appointment = await Appointment.findOne({
        _id: id,
        patientId: user.id,
      })
        .populate("consultantId")
        .populate("centerId");

      if (!appointment) {
        throw new GraphQLError("Appointment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return appointment;
    },

    checkAvailability: async (
      _: unknown,
      {
        consultantId,
        date,
        time,
      }: { consultantId: string; date: string; time: string }
    ) => {
      if (!mongoose.Types.ObjectId.isValid(consultantId)) {
        throw new GraphQLError("Invalid consultant ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const consultant = await Consultant.findById(consultantId);
      if (!consultant) {
        throw new GraphQLError("Consultant not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const appointmentDate = new Date(date);
      const existingAppointment = await Appointment.findOne({
        consultantId,
        date: appointmentDate,
        time,
        status: { $in: ["booked", "completed"] },
      });

      return !existingAppointment;
    },
  },

  Mutation: {
    createAppointment: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);
      createAppointmentSchema.parse(input);

      if (!mongoose.Types.ObjectId.isValid(input.consultantId as string)) {
        throw new GraphQLError("Invalid consultant ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      if (!mongoose.Types.ObjectId.isValid(input.centerId as string)) {
        throw new GraphQLError("Invalid center ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      // Verify consultant exists
      const consultant = await Consultant.findById(input.consultantId);
      if (!consultant || !consultant.isActive) {
        throw new GraphQLError("Consultant not found or inactive", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Verify center exists
      const center = await Center.findById(input.centerId);
      if (!center || !center.isActive) {
        throw new GraphQLError("Center not found or inactive", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Check if consultant belongs to the center
      if (consultant.centerId.toString() !== input.centerId) {
        throw new GraphQLError(
          "Consultant does not belong to the specified center",
          {
            extensions: { code: "INVALID_INPUT" },
          }
        );
      }

      // Check time slot availability
      const appointmentDate = new Date(input.date as string);
      const consultantObjectId = new mongoose.Types.ObjectId(
        input.consultantId as string
      );
      const existingAppointment = await Appointment.findOne({
        consultantId: consultantObjectId,
        date: appointmentDate,
        time: input.time as string,
        status: { $in: ["booked", "completed"] },
      });

      if (existingAppointment) {
        throw new GraphQLError("Time slot is already booked", {
          extensions: { code: "CONFLICT" },
        });
      }

      // Convert GraphQL enum to database value
      const appointmentTypeMap: Record<string, "in-person" | "online"> = {
        IN_PERSON: "in-person",
        ONLINE: "online",
      };
      const dbType =
        appointmentTypeMap[input.type as string] ||
        (input.type as "in-person" | "online");

      // Create appointment
      const appointment = await Appointment.create({
        patientId: new mongoose.Types.ObjectId(user.id),
        consultantId: consultantObjectId,
        centerId: new mongoose.Types.ObjectId(input.centerId as string),
        date: appointmentDate,
        time: input.time as string,
        type: dbType,
        bookingFee: (input.bookingFee as number) || 100,
        status: "booked" as const,
      });

      // Fetch with populated fields
      return Appointment.findById(appointment._id)
        .populate("consultantId")
        .populate("centerId");
    },

    updateAppointment: async (
      _: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid appointment ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      updateAppointmentSchema.parse(input);

      const appointment = await Appointment.findOne({
        _id: id,
        patientId: user.id,
      });

      if (!appointment) {
        throw new GraphQLError("Appointment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // If updating date/time, check for conflicts
      if (input.date || input.time) {
        const newDate = input.date
          ? new Date(input.date as string)
          : appointment.date;
        const newTime = (input.time as string) || appointment.time;

        const existingAppointment = await Appointment.findOne({
          consultantId: appointment.consultantId,
          date: newDate,
          time: newTime,
          status: { $in: ["booked", "completed"] },
          _id: { $ne: id },
        });

        if (existingAppointment) {
          throw new GraphQLError("Time slot is already booked", {
            extensions: { code: "CONFLICT" },
          });
        }
      }

      // Convert GraphQL enum to database value if type is being updated
      const appointmentTypeMap: Record<string, "in-person" | "online"> = {
        IN_PERSON: "in-person",
        ONLINE: "online",
      };

      const updateData: Record<string, unknown> = { ...input };
      if (input.date) {
        updateData.date = new Date(input.date as string);
      }
      if (input.type) {
        updateData.type =
          appointmentTypeMap[input.type as string] || input.type;
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("consultantId")
        .populate("centerId");

      return updatedAppointment!;
    },

    cancelAppointment: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid appointment ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const appointment = await Appointment.findOneAndUpdate(
        { _id: id, patientId: user.id },
        { $set: { status: "cancelled" } },
        { new: true, runValidators: true }
      )
        .populate("consultantId")
        .populate("centerId");

      if (!appointment) {
        throw new GraphQLError("Appointment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return appointment;
    },
  },

  Appointment: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    patientId: (parent: { patientId: mongoose.Types.ObjectId | string }) => {
      return typeof parent.patientId === "string"
        ? parent.patientId
        : parent.patientId.toString();
    },
    consultantId: (parent: {
      consultantId: mongoose.Types.ObjectId | string;
    }) => {
      return typeof parent.consultantId === "string"
        ? parent.consultantId
        : parent.consultantId.toString();
    },
    centerId: (parent: { centerId: mongoose.Types.ObjectId | string }) => {
      return typeof parent.centerId === "string"
        ? parent.centerId
        : parent.centerId.toString();
    },
    consultant: async (parent: {
      consultantId: mongoose.Types.ObjectId | any;
    }) => {
      // If already populated (has name property), return it
      if (
        parent.consultantId &&
        typeof parent.consultantId === "object" &&
        "name" in parent.consultantId
      ) {
        return parent.consultantId;
      }
      // Otherwise, fetch it
      return Consultant.findById(parent.consultantId);
    },
    center: async (parent: { centerId: mongoose.Types.ObjectId | any }) => {
      // If already populated (has name property), return it
      if (
        parent.centerId &&
        typeof parent.centerId === "object" &&
        "name" in parent.centerId
      ) {
        return parent.centerId;
      }
      // Otherwise, fetch it
      return Center.findById(parent.centerId);
    },
    date: (parent: { date: Date }) => {
      return parent.date.toISOString();
    },
    type: (parent: { type: "in-person" | "online" }) => {
      // Convert database value to GraphQL enum
      const typeMap: Record<string, "IN_PERSON" | "ONLINE"> = {
        "in-person": "IN_PERSON",
        online: "ONLINE",
      };
      return typeMap[parent.type] || parent.type;
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },
};
