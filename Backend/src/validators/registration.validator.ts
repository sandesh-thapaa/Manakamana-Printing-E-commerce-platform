import { z } from "zod";

export const createRegistrationRequestSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  owner_name: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Valid phone number is required"),
  business_address: z.string().optional(),
  notes: z.string().optional(),
});

export const rejectRegistrationRequestSchema = z.object({
  reason: z.string().min(5, "Rejection reason must be at least 5 characters"),
});
