import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(2).max(255),
  docType: z.string().min(1).max(100),
  approverIds: z.array(z.string().uuid()).min(1).max(5),
  attachmentUrls: z.array(z.string()).optional().default([]),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const decideDocumentSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(1000).optional(),
});

export type DecideDocumentInput = z.infer<typeof decideDocumentSchema>;
