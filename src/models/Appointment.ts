import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  type: "in-person" | "online";
  status: "booked" | "completed" | "cancelled";
  bookingFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: "Consultant",
      required: [true, "Consultant ID is required"],
    },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      required: [true, "Center ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["in-person", "online"],
        message: "Appointment type must be in-person or online",
      },
      required: [true, "Appointment type is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["booked", "completed", "cancelled"],
        message: "Status must be booked, completed, or cancelled",
      },
      default: "booked",
    },
    bookingFee: {
      type: Number,
      default: 100,
      min: [0, "Booking fee cannot be negative"],
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ consultantId: 1, date: 1, time: 1 });
appointmentSchema.index({ centerId: 1, date: 1 });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
