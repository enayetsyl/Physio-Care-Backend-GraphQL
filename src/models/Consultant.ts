import mongoose, { Document, Schema } from "mongoose";

export interface IConsultant extends Document {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  centerId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const consultantSchema = new Schema<IConsultant>(
  {
    name: {
      type: String,
      required: [true, "Consultant name is required"],
      trim: true,
      minlength: [2, "Consultant name must be at least 2 characters"],
      maxlength: [200, "Consultant name cannot exceed 200 characters"],
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      required: [true, "Center ID is required"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

consultantSchema.index({ centerId: 1, isActive: 1 });

export const Consultant = mongoose.model<IConsultant>(
  "Consultant",
  consultantSchema
);
