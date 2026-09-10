import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateReservationInput, DecideReservationInput } from "./validations";

export interface ResourceDto {
  id: string;
  tenantId: string;
  type: "ROOM" | "VEHICLE";
  nameTh: string;
  nameEn: string;
  capacity: number;
  locationOrPlate: string;
  amenities: string[];
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface ReservationDto {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceType: "ROOM" | "VEHICLE";
  locationOrPlate: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  startTime: string;
  endTime: string;
  attendeesCount: number;
  contactPhone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
}

import type { Prisma } from "@/generated/prisma";

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    resource: true;
    user: { select: { id: true; name: true; email: true } };
  };
}>;

function mapReservationDto(res: ReservationWithRelations): ReservationDto {
  return {
    id: res.id,
    tenantId: res.tenantId,
    resourceId: res.resourceId,
    resourceNameTh: res.resource?.nameTh || "",
    resourceNameEn: res.resource?.nameEn || "",
    resourceType: res.resource?.type || "ROOM",
    locationOrPlate: res.resource?.locationOrPlate || "",
    userId: res.userId,
    userName: res.user?.name || res.user?.email || "User",
    userEmail: res.user?.email || "",
    title: res.title,
    startTime: res.startTime.toISOString(),
    endTime: res.endTime.toISOString(),
    attendeesCount: res.attendeesCount,
    contactPhone: res.contactPhone,
    status: res.status,
    rejectReason: res.rejectReason,
    approvedById: res.approvedById,
    approvedAt: res.approvedAt ? res.approvedAt.toISOString() : null,
    createdAt: res.createdAt.toISOString(),
  };
}

export async function listResources(
  tenantId: string,
  type?: "ROOM" | "VEHICLE",
): Promise<ResourceDto[]> {
  const items = await prisma.resource.findMany({
    where: {
      tenantId,
      ...(type ? { type } : {}),
      isAvailable: true,
    },
    orderBy: { nameTh: "asc" },
  });

  return items.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    type: r.type,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    locationOrPlate: r.locationOrPlate,
    amenities: Array.isArray(r.amenities) ? (r.amenities as string[]) : [],
    imageUrl: r.imageUrl,
    isAvailable: r.isAvailable,
  }));
}

export async function listReservations(
  tenantId: string,
  filters?: { resourceId?: string; status?: string; fromDate?: Date },
): Promise<ReservationDto[]> {
  const items = await prisma.reservation.findMany({
    where: {
      tenantId,
      ...(filters?.resourceId ? { resourceId: filters.resourceId } : {}),
      ...(filters?.status ? { status: filters.status as Prisma.EnumReservationStatusFilter["equals"] } : {}),
      ...(filters?.fromDate ? { startTime: { gte: filters.fromDate } } : {}),
    },
    include: {
      resource: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return items.map(mapReservationDto);
}

export async function createReservation(
  tenantId: string,
  userId: string,
  input: CreateReservationInput,
): Promise<ReservationDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  // Check collision with existing pending or approved reservations
  const collision = await prisma.reservation.findFirst({
    where: {
      tenantId,
      resourceId: input.resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (collision) {
    throw new Error("booking.conflict");
  }

  const created = await prisma.reservation.create({
    data: {
      tenantId,
      userId,
      resourceId: input.resourceId,
      title: input.title,
      startTime: start,
      endTime: end,
      attendeesCount: input.attendeesCount,
      contactPhone: input.contactPhone ?? null,
      status: "PENDING",
    },
    include: {
      resource: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return mapReservationDto(created);
}

export async function decideReservation(
  tenantId: string,
  approverId: string,
  input: DecideReservationInput,
): Promise<ReservationDto> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId, tenantId },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  const updated = await prisma.reservation.update({
    where: { id: input.reservationId },
    data: {
      status: input.decision,
      rejectReason: input.decision === "REJECTED" ? input.rejectReason ?? null : null,
      approvedById: approverId,
      approvedAt: new Date(),
    },
    include: {
      resource: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return mapReservationDto(updated);
}
