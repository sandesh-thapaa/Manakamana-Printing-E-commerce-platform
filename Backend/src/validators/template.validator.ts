import { z } from "zod";

export const getTemplatesQuerySchema = z.object({
  category: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  search: z.string().optional(),
});

export const createTemplateCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-0-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const createTemplateSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid(),
  fileUrl: z.string().url().optional(), // If provided directly, otherwise from file upload
  isActive: z.boolean().optional().default(true),
});
