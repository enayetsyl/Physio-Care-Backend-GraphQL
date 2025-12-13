import { z } from "zod";

export const createAppointmentSchema = z.object({
  consultantId: z.string().min(1, "Consultant ID is required"),
  centerId: z.string().min(1, "Center ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["IN_PERSON", "ONLINE"], {
    message: "Appointment type must be IN_PERSON or ONLINE",
  }),
  bookingFee: z.number().min(0).optional(),
});

export const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  type: z.enum(["IN_PERSON", "ONLINE"]).optional(),
  status: z.enum(["booked", "completed", "cancelled"]).optional(),
  bookingFee: z.number().min(0).optional(),
});
