import { z } from "zod";

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
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

export const createDepartmentSchema = z.object({
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  headName: z.string().max(255).optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const deleteDepartmentSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DeleteDepartmentInput = z.infer<typeof deleteDepartmentSchema>;
