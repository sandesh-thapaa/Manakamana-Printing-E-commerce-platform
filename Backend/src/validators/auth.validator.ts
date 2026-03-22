import { z } from "zod";

export const loginSchema = z.object({
  phone_number: z.string().optional(), // For clients
  email: z.string().email().optional(), // For admins
  password: z.string().min(1, "Password is required"),
});