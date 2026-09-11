import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateReservationInput,
  DecideReservationInput,
  UpdateReservationInput,
  CreateResourceInput,
  UpdateResourceInput,
} from "./validations";

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
  includeUnavailable = false,
): Promise<ResourceDto[]> {
  const items = await prisma.resource.findMany({
    where: {
      tenantId,
      ...(type ? { type } : {}),
      ...(includeUnavailable ? {} : { isAvailable: true }),
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
    throw errors.conflict("booking.conflict");
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
    throw errors.not_found("booking.notFound");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.update({
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

    await writeAudit(
      {
        tenantId,
        actorId: approverId,
        action: `booking.${input.decision.toLowerCase()}`,
        entity: "reservation",
        entityId: res.id,
        before: { status: reservation.status },
        after: { status: input.decision, rejectReason: input.rejectReason },
      },
      tx,
    );

    return res;
  });

  return mapReservationDto(updated);
}

export async function updateReservation(
  tenantId: string,
  userId: string,
  input: UpdateReservationInput,
  isManager = false,
): Promise<ReservationDto> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId, tenantId },
  });

  if (!reservation) {
    throw errors.not_found("booking.notFound");
  }

  if (!isManager && reservation.userId !== userId) {
    throw errors.forbidden("error.forbidden");
  }

  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  // Check collision with existing pending or approved reservations, excluding this reservation itself
  const collision = await prisma.reservation.findFirst({
    where: {
      tenantId,
      resourceId: input.resourceId,
      id: { not: input.reservationId },
      status: { in: ["PENDING", "APPROVED"] },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (collision) {
    throw errors.conflict("booking.conflict");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.update({
      where: { id: input.reservationId },
      data: {
        resourceId: input.resourceId,
        title: input.title,
        startTime: start,
        endTime: end,
        attendeesCount: input.attendeesCount,
        contactPhone: input.contactPhone ?? null,
      },
      include: {
        resource: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "booking.update",
        entity: "reservation",
        entityId: res.id,
        before: {
          title: reservation.title,
          resourceId: reservation.resourceId,
          startTime: reservation.startTime.toISOString(),
          endTime: reservation.endTime.toISOString(),
        },
        after: {
          title: input.title,
          resourceId: input.resourceId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      },
      tx,
    );

    return res;
  });

  return mapReservationDto(updated);
}

export async function cancelReservation(
  tenantId: string,
  userId: string,
  reservationId: string,
  isManager = false,
): Promise<ReservationDto> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, tenantId },
  });

  if (!reservation) {
    throw errors.not_found("booking.notFound");
  }

  if (!isManager && reservation.userId !== userId) {
    throw errors.forbidden("error.forbidden");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
      },
      include: {
        resource: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "booking.cancel",
        entity: "reservation",
        entityId: res.id,
        before: { status: reservation.status },
        after: { status: "CANCELLED" },
      },
      tx,
    );

    return res;
  });

  return mapReservationDto(updated);
}

export async function createResource(
  tenantId: string,
  actorId: string,
  input: CreateResourceInput,
): Promise<ResourceDto> {
  const created = await prisma.$transaction(async (tx) => {
    const res = await tx.resource.create({
      data: {
        tenantId,
        type: input.type,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        capacity: input.capacity,
        locationOrPlate: input.locationOrPlate,
        amenities: input.amenities,
        imageUrl: input.imageUrl ?? null,
        isAvailable: input.isAvailable,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "resource.create",
        entity: "resource",
        entityId: res.id,
        after: {
          nameTh: res.nameTh,
          type: res.type,
          capacity: res.capacity,
        },
      },
      tx,
    );

    return res;
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    type: created.type,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    capacity: created.capacity,
    locationOrPlate: created.locationOrPlate,
    amenities: Array.isArray(created.amenities) ? (created.amenities as string[]) : [],
    imageUrl: created.imageUrl,
    isAvailable: created.isAvailable,
  };
}

export async function updateResource(
  tenantId: string,
  actorId: string,
  input: UpdateResourceInput,
): Promise<ResourceDto> {
  const resource = await prisma.resource.findFirst({
    where: { id: input.resourceId, tenantId },
  });

  if (!resource) {
    throw errors.not_found("booking.notFound");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.resource.update({
      where: { id: input.resourceId },
      data: {
        ...(input.type ? { type: input.type } : {}),
        ...(input.nameTh ? { nameTh: input.nameTh } : {}),
        ...(input.nameEn ? { nameEn: input.nameEn } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.locationOrPlate ? { locationOrPlate: input.locationOrPlate } : {}),
        ...(input.amenities ? { amenities: input.amenities } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "resource.update",
        entity: "resource",
        entityId: res.id,
        before: {
          nameTh: resource.nameTh,
          capacity: resource.capacity,
          isAvailable: resource.isAvailable,
        },
        after: {
          nameTh: res.nameTh,
          capacity: res.capacity,
          isAvailable: res.isAvailable,
        },
      },
      tx,
    );

    return res;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    type: updated.type,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    capacity: updated.capacity,
    locationOrPlate: updated.locationOrPlate,
    amenities: Array.isArray(updated.amenities) ? (updated.amenities as string[]) : [],
    imageUrl: updated.imageUrl,
    isAvailable: updated.isAvailable,
  };
}

export async function deleteResource(
  tenantId: string,
  actorId: string,
  resourceId: string,
): Promise<{ id: string }> {
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, tenantId },
  });

  if (!resource) {
    throw errors.not_found("booking.notFound");
  }

  const inUse = await prisma.reservation.findFirst({
    where: {
      tenantId,
      resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      endTime: { gte: new Date() },
    },
  });

  if (inUse) {
    throw errors.conflict("booking.resource.cannotDeleteInUse");
  }

  await prisma.$transaction(async (tx) => {
    await tx.resource.delete({
      where: { id: resourceId },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "resource.delete",
        entity: "resource",
        entityId: resourceId,
        before: { nameTh: resource.nameTh },
      },
      tx,
    );
  });

  return { id: resourceId };
}

