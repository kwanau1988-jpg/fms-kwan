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

export const upsertPayrollSlipSchema = z.object({
  periodId: z.string().uuid(),
  userId: z.string().uuid(),
  baseSalary: z.coerce.number().min(0),
  academicAllowance: z.coerce.number().min(0).default(0),
  positionAllowance: z.coerce.number().min(0).default(0),
  specialAllowance: z.coerce.number().min(0).default(0),
  taxWithholding: z.coerce.number().min(0).default(0),
  socialSecurity: z.coerce.number().min(0).default(0),
  providentFund: z.coerce.number().min(0).default(0),
  cooperatives: z.coerce.number().min(0).default(0),
  bankAccountMasked: z.string().max(50).optional().nullable(),
  loginPassword: z.string().min(8).optional().nullable(),
});

export type UpsertPayrollSlipInput = z.infer<typeof upsertPayrollSlipSchema>;

export const deletePayrollSlipSchema = z.object({
  slipId: z.string().uuid(),
});

export type DeletePayrollSlipInput = z.infer<typeof deletePayrollSlipSchema>;

export const setUserPasswordDirectSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8),
});

export type SetUserPasswordDirectInput = z.infer<typeof setUserPasswordDirectSchema>;

