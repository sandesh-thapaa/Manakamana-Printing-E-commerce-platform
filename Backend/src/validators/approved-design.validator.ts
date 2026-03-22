import { z } from "zod";

export const verifyDesignSchema = z.object({
  designId: z.string().max(50),
});

export const adminApprovedDesignQuerySchema = z.object({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  clientId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

export const archiveDesignSchema = z.object({
  reason: z.string().max(500).optional(),
});
