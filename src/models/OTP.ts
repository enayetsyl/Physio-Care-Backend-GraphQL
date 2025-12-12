import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  mobile: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    mobile: {
      type: String,
      required: true,
      match: [/^(01[3-9]\d{8}|[6-9]\d{9})$/, "Invalid mobile number"],
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ mobile: 1, createdAt: -1 });

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
