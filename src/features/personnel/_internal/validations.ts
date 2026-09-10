import { z } from "zod";

export const createPersonnelProfileSchema = z.object({
  academicTitle: z.string().max(50).optional().or(z.literal("")),
  firstNameTh: z.string().min(1).max(100),
  lastNameTh: z.string().min(1).max(100),
  firstNameEn: z.string().min(1).max(100),
  lastNameEn: z.string().min(1).max(100),
  departmentTh: z.string().min(1).max(150),
  departmentEn: z.string().min(1).max(150),
  positionTh: z.string().min(1).max(150),
  positionEn: z.string().min(1).max(150),
  email: z.string().email(),
  phoneExt: z.string().max(50).optional().or(z.literal("")),
  roomNumber: z.string().max(50).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  displayOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const updatePersonnelProfileSchema = createPersonnelProfileSchema.extend({
  id: z.string().uuid(),
});

export type CreatePersonnelProfileInput = z.infer<typeof createPersonnelProfileSchema>;
export type UpdatePersonnelProfileInput = z.infer<typeof updatePersonnelProfileSchema>;
