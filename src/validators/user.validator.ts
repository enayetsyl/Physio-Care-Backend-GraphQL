import { z } from "zod";

const mobileSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, "Invalid BD mobile number (e.g., 017xxxxxxxx)");

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: mobileSchema,
  email: z.email({ message: "Invalid email address" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.email({ message: "Invalid email address" }).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  age: z.number().min(0).max(150).optional(),
  weight: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  bloodGroup: z
    .enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ])
    .optional(),
});

export const otpSchema = z.object({
  mobile: mobileSchema,
  otp: z.string().length(6),
});

export const sendOTPSchema = z.object({
  mobile: mobileSchema,
});
