import { prisma } from "@/shared/lib/infra/prisma";
import type { CreatePersonnelProfileInput, UpdatePersonnelProfileInput } from "./validations";

export interface PersonnelProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  academicTitle: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  departmentTh: string;
  departmentEn: string;
  positionTh: string;
  positionEn: string;
  email: string;
  phoneExt: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listPersonnelProfiles(tenantId: string): Promise<PersonnelProfileDto[]> {
  const items = await prisma.personnelProfile.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    userId: item.userId,
    academicTitle: item.academicTitle,
    firstNameTh: item.firstNameTh,
    lastNameTh: item.lastNameTh,
    firstNameEn: item.firstNameEn,
    lastNameEn: item.lastNameEn,
    departmentTh: item.departmentTh,
    departmentEn: item.departmentEn,
    positionTh: item.positionTh,
    positionEn: item.positionEn,
    email: item.email,
    phoneExt: item.phoneExt,
    roomNumber: item.roomNumber,
    avatarUrl: item.avatarUrl,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

import type { Prisma } from "@/generated/prisma";

export async function listActivePersonnel(department?: string): Promise<PersonnelProfileDto[]> {
  const where: Prisma.PersonnelProfileWhereInput = { isActive: true };
  if (department && department !== "ALL") {
    where.departmentTh = department;
  }
  const items = await prisma.personnelProfile.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    userId: item.userId,
    academicTitle: item.academicTitle,
    firstNameTh: item.firstNameTh,
    lastNameTh: item.lastNameTh,
    firstNameEn: item.firstNameEn,
    lastNameEn: item.lastNameEn,
    departmentTh: item.departmentTh,
    departmentEn: item.departmentEn,
    positionTh: item.positionTh,
    positionEn: item.positionEn,
    email: item.email,
    phoneExt: item.phoneExt,
    roomNumber: item.roomNumber,
    avatarUrl: item.avatarUrl,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function createPersonnelProfile(tenantId: string, input: CreatePersonnelProfileInput): Promise<PersonnelProfileDto> {
  const created = await prisma.personnelProfile.create({
    data: {
      tenantId,
      academicTitle: input.academicTitle || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      departmentTh: input.departmentTh,
      departmentEn: input.departmentEn,
      positionTh: input.positionTh,
      positionEn: input.positionEn,
      email: input.email,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    userId: created.userId,
    academicTitle: created.academicTitle,
    firstNameTh: created.firstNameTh,
    lastNameTh: created.lastNameTh,
    firstNameEn: created.firstNameEn,
    lastNameEn: created.lastNameEn,
    departmentTh: created.departmentTh,
    departmentEn: created.departmentEn,
    positionTh: created.positionTh,
    positionEn: created.positionEn,
    email: created.email,
    phoneExt: created.phoneExt,
    roomNumber: created.roomNumber,
    avatarUrl: created.avatarUrl,
    displayOrder: created.displayOrder,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updatePersonnelProfile(tenantId: string, input: UpdatePersonnelProfileInput): Promise<PersonnelProfileDto> {
  const updated = await prisma.personnelProfile.update({
    where: { id: input.id, tenantId },
    data: {
      academicTitle: input.academicTitle || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      departmentTh: input.departmentTh,
      departmentEn: input.departmentEn,
      positionTh: input.positionTh,
      positionEn: input.positionEn,
      email: input.email,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    userId: updated.userId,
    academicTitle: updated.academicTitle,
    firstNameTh: updated.firstNameTh,
    lastNameTh: updated.lastNameTh,
    firstNameEn: updated.firstNameEn,
    lastNameEn: updated.lastNameEn,
    departmentTh: updated.departmentTh,
    departmentEn: updated.departmentEn,
    positionTh: updated.positionTh,
    positionEn: updated.positionEn,
    email: updated.email,
    phoneExt: updated.phoneExt,
    roomNumber: updated.roomNumber,
    avatarUrl: updated.avatarUrl,
    displayOrder: updated.displayOrder,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deletePersonnelProfile(tenantId: string, id: string): Promise<void> {
  await prisma.personnelProfile.delete({
    where: { id, tenantId },
  });
}
