import mongoose, { Document, Schema } from "mongoose";

export interface ICenter extends Document {
  name: string;
  address: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const centerSchema = new Schema<ICenter>(
  {
    name: {
      type: String,
      required: [true, "Center name is required"],
      trim: true,
      minlength: [2, "Center name must be at least 2 characters"],
      maxlength: [200, "Center name cannot exceed 200 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

centerSchema.index({ city: 1, isActive: 1 });

export const Center = mongoose.model<ICenter>("Center", centerSchema);
