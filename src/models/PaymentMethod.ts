import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentMethod extends Document {
  patientId: mongoose.Types.ObjectId;
  type: "card" | "upi" | "bank";
  last4?: string;
  bankName?: string;
  upiId?: string;
  cardBrand?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["card", "upi", "bank"],
        message: "Payment method type must be card, upi, or bank",
      },
      required: [true, "Payment method type is required"],
    },
    last4: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Last 4 digits must be exactly 4 numbers"],
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [100, "Bank name cannot exceed 100 characters"],
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format"],
    },
    cardBrand: {
      type: String,
      trim: true,
      enum: {
        values: ["visa", "mastercard", "rupay", "amex"],
        message: "Card brand must be visa, mastercard, rupay, or amex",
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
paymentMethodSchema.index({ patientId: 1, isActive: 1 });
paymentMethodSchema.index({ patientId: 1, isDefault: 1 });

// Pre-save hook to ensure only one default payment method per patient
paymentMethodSchema.pre("save", async function () {
  if (this.isDefault && this.isModified("isDefault")) {
    try {
      const PaymentMethodModel = mongoose.models.PaymentMethod || mongoose.model("PaymentMethod", paymentMethodSchema);
      await PaymentMethodModel.updateMany(
        { patientId: this.patientId, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    } catch (error) {
      console.error("Error in PaymentMethod pre-save hook:", error);
    }
  }
});

export const PaymentMethod = mongoose.model<IPaymentMethod>(
  "PaymentMethod",
  paymentMethodSchema
);
