import { z } from "zod";

export const createSessionSchema = z.object({
  courseId: z.string().uuid(),
  roomNumber: z.string().max(50).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const checkInSchema = z.object({
  sessionId: z.string().uuid(),
  qrToken: z.string().min(6).max(255),
  remark: z.string().max(255).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const updateRecordStatusSchema = z.object({
  recordId: z.string().uuid(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
  remark: z.string().max(255).optional(),
});

export type UpdateRecordStatusInput = z.infer<typeof updateRecordStatusSchema>;
