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

export const updateReservationSchema = z
  .object({
    reservationId: z.string().uuid(),
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

export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;

export const cancelReservationSchema = z.object({
  reservationId: z.string().uuid(),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

export const createResourceSchema = z.object({
  type: z.enum(["ROOM", "VEHICLE"]).default("ROOM"),
  nameTh: z.string().min(2).max(255),
  nameEn: z.string().min(2).max(255),
  capacity: z.coerce.number().int().min(1).default(10),
  locationOrPlate: z.string().min(2).max(255),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().url().nullable().optional(),
  isAvailable: z.boolean().default(true),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = z.object({
  resourceId: z.string().uuid(),
  type: z.enum(["ROOM", "VEHICLE"]).optional(),
  nameTh: z.string().min(2).max(255).optional(),
  nameEn: z.string().min(2).max(255).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  locationOrPlate: z.string().min(2).max(255).optional(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isAvailable: z.boolean().optional(),
});

export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export const deleteResourceSchema = z.object({
  resourceId: z.string().uuid(),
});

export type DeleteResourceInput = z.infer<typeof deleteResourceSchema>;

