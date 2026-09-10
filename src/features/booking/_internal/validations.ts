import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid(),
    title: z.string().min(2).max(255),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    attendeesCount: z.coerce.number().int().min(1).default(1),
    contactPhone: z.string().max(50).optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const decideReservationSchema = z.object({
  reservationId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  rejectReason: z.string().max(500).optional(),
});

export type DecideReservationInput = z.infer<typeof decideReservationSchema>;
