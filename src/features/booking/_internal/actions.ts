"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { hasPermission, requirePermission } from "@/features/identity/server";
import { BOOKING_P } from "../permissions";
import {
  createReservationSchema,
  decideReservationSchema,
  updateReservationSchema,
  cancelReservationSchema,
  createResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
} from "./validations";
import {
  listReservations,
  listResources,
  createReservation,
  updateReservation,
  cancelReservation,
  decideReservation,
  createResource,
  updateResource,
  deleteResource,
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
  includeUnavailable = false,
): Promise<ActionResult<ResourceDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    return listResources(ctx.tenantId, type, includeUnavailable);
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

export async function updateReservationAction(
  input: unknown,
): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingCreate);
    const parsed = updateReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const isManager = hasPermission(ctx, BOOKING_P.bookingManage) || hasPermission(ctx, BOOKING_P.bookingApprove);
    const result = await updateReservation(ctx.tenantId, ctx.userId, parsed, isManager);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}

export async function cancelReservationAction(
  input: unknown,
): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingCreate);
    const parsed = cancelReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const isManager = hasPermission(ctx, BOOKING_P.bookingManage) || hasPermission(ctx, BOOKING_P.bookingApprove);
    const result = await cancelReservation(ctx.tenantId, ctx.userId, parsed.reservationId, isManager);
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

export async function createResourceAction(
  input: unknown,
): Promise<ActionResult<ResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = createResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createResource(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}

export async function updateResourceAction(
  input: unknown,
): Promise<ActionResult<ResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = updateResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateResource(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}

export async function deleteResourceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = deleteResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await deleteResource(ctx.tenantId, ctx.userId, parsed.resourceId);
    revalidatePath("/booking");
    revalidatePath("/portal/facilities");
    return result;
  });
}

