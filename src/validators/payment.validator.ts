import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(1, "Amount must be at least ₹1")
    .max(1000000, "Amount cannot exceed ₹10,00,000"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  appointmentId: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
  method: z.enum(["CARD", "UPI", "NETBANKING", "WALLET"], {
    message: "Payment method must be CARD, UPI, NETBANKING, or WALLET",
  }),
});

export const createPaymentMethodSchema = z.object({
  type: z.enum(["CARD", "UPI", "BANK"], {
    message: "Payment method type must be CARD, UPI, or BANK",
  }),
  last4: z
    .string()
    .regex(/^\d{4}$/, "Last 4 digits must be exactly 4 numbers")
    .optional(),
  bankName: z
    .string()
    .max(100, "Bank name cannot exceed 100 characters")
    .optional(),
  upiId: z
    .string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format")
    .optional(),
  cardBrand: z
    .enum(["VISA", "MASTERCARD", "RUPAY", "AMEX"], {
      message: "Card brand must be VISA, MASTERCARD, RUPAY, or AMEX",
    })
    .optional(),
  isDefault: z.boolean().optional(),
});

export const updatePaymentMethodSchema = z.object({
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
