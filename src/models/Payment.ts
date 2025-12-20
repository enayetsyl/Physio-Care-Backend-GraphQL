import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  patientId: mongoose.Types.ObjectId;
  amount: number;
  method: "card" | "upi" | "netbanking" | "wallet";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  description?: string;
  appointmentId?: mongoose.Types.ObjectId;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    method: {
      type: String,
      enum: {
        values: ["card", "upi", "netbanking", "wallet"],
        message: "Payment method must be card, upi, netbanking, or wallet",
      },
      required: [true, "Payment method is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Status must be pending, completed, failed, or refunded",
      },
      default: "pending",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [500, "Failure reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
paymentSchema.index({ patientId: 1, status: 1 });
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ appointmentId: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
