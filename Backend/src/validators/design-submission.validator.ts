import { z } from "zod";

export const designSubmissionSchema = z.object({
  templateId: z.string().optional(),
  title: z.string().max(150).optional(),
  notes: z.string().max(1000).optional(),
});

export const designSubmissionQuerySchema = z.object({
  status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export const adminDesignSubmissionQuerySchema = z.object({
  status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  clientId: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sort: z.enum(["submittedAt.desc", "submittedAt.asc"]).optional().default("submittedAt.desc"),
});

export const adminApproveSubmissionSchema = z.object({
  previewUrl: z.string().optional(), // In a real system, we'd auto-generate this, but spec says it's required if no auto-generation
  note: z.string().max(500).optional(),
});

export const adminRejectSubmissionSchema = z.object({
  feedbackMessage: z.string().max(1000),
});
