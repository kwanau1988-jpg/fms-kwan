import { z } from "zod";

export const createCurriculumSchema = z.object({
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  degreeTh: z.string().min(1).max(255),
  degreeEn: z.string().min(1).max(255),
  degreeLevel: z.enum(["BACHELOR", "MASTER", "DOCTORAL", "SHORT_COURSE"]).default("BACHELOR"),
  totalCredits: z.coerce.number().min(0).default(120),
  tuitionFee: z.coerce.number().min(0).optional(),
  brochurePdfUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["OPEN", "UPDATING", "CLOSED"]).default("OPEN"),
});

export const updateCurriculumSchema = createCurriculumSchema.extend({
  id: z.string().uuid(),
});

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
