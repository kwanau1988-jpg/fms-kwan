"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { BOOKING_P } from "../permissions";
import { createReservationSchema, decideReservationSchema } from "./validations";
import {
  listReservations,
  listResources,
  createReservation,
  decideReservation,
  type ReservationDto,
  type ResourceDto,
} from "./services";

export async function getReservationsAction(filters?: {
  resourceId?: string;
  status?: string;
}): Promise<ActionResult<ReservationDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    return listReservations(ctx.tenantId, filters);
  });
}

export async function getResourcesAction(
  type?: "ROOM" | "VEHICLE",
): Promise<ActionResult<ResourceDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    return listResources(ctx.tenantId, type);
  });
}

export async function createReservationAction(
  input: unknown,
): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingCreate);
    const parsed = createReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}

export async function decideReservationAction(
  input: unknown,
): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingApprove);
    const parsed = decideReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await decideReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}
