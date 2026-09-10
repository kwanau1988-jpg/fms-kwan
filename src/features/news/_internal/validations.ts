import { z } from "zod";

export const createNewsArticleSchema = z.object({
  titleTh: z.string().min(1).max(255),
  titleEn: z.string().min(1).max(255),
  category: z.enum(["ACADEMIC", "ACTIVITY", "RESEARCH", "GENERAL"]).default("GENERAL"),
  summaryTh: z.string().max(1000).optional(),
  summaryEn: z.string().max(1000).optional(),
  contentTh: z.string().min(1),
  contentEn: z.string().min(1),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  isPinned: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
