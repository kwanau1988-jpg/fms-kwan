import { z } from "zod";

export const createPeriodSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;

export const togglePublishPeriodSchema = z.object({
  periodId: z.string().uuid(),
  isPublished: z.boolean(),
});

export type TogglePublishPeriodInput = z.infer<typeof togglePublishPeriodSchema>;

export const generateDemoSlipsSchema = z.object({
  periodId: z.string().uuid(),
});

export type GenerateDemoSlipsInput = z.infer<typeof generateDemoSlipsSchema>;
