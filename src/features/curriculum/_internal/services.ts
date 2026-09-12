import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/features/identity/server";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentCode?: string | null;
  departmentNameTh?: string | null;
  departmentNameEn?: string | null;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeLevel: string;
  totalCredits: number;
  tuitionFee: number | null;
  brochurePdfUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  headName: string | null;
  email: string | null;
  phone: string | null;
  officeRoom: string | null;
  displayOrder: number;
  isActive: boolean;
  curriculaCount: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Department Services
// ----------------------------------------------------

export async function listDepartments(
  tenantId: string,
  includeInactive = false
): Promise<DepartmentDto[]> {
  const where: Prisma.DepartmentWhereInput = { tenantId };
  if (!includeInactive) {
    where.isActive = true;
  }
  const items = await prisma.department.findMany({
    where,
    include: {
      _count: {
        select: { curricula: true },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    description: item.description,
    headName: item.headName,
    email: item.email,
    phone: item.phone,
    officeRoom: item.officeRoom,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    curriculaCount: item._count.curricula,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function listActiveDepartments(): Promise<DepartmentDto[]> {
  const items = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { curricula: true },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    description: item.description,
    headName: item.headName,
    email: item.email,
    phone: item.phone,
    officeRoom: item.officeRoom,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    curriculaCount: item._count.curricula,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getDepartment(
  tenantId: string,
  id: string
): Promise<DepartmentDto | null> {
  const item = await prisma.department.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: { curricula: true },
      },
    },
  });
  if (!item) return null;
  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    description: item.description,
    headName: item.headName,
    email: item.email,
    phone: item.phone,
    officeRoom: item.officeRoom,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    curriculaCount: item._count.curricula,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function createDepartment(
  tenantId: string,
  userId: string,
  input: CreateDepartmentInput
): Promise<DepartmentDto> {
  return await prisma.$transaction(async (tx) => {
    const created = await tx.department.create({
      data: {
        tenantId,
        code: input.code,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        description: input.description || null,
        headName: input.headName || null,
        email: input.email || null,
        phone: input.phone || null,
        officeRoom: input.officeRoom || null,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "department.create",
        entity: "department",
        entityId: created.id,
        after: created,
      },
      tx
    );

    return {
      id: created.id,
      tenantId: created.tenantId,
      code: created.code,
      nameTh: created.nameTh,
      nameEn: created.nameEn,
      description: created.description,
      headName: created.headName,
      email: created.email,
      phone: created.phone,
      officeRoom: created.officeRoom,
      displayOrder: created.displayOrder,
      isActive: created.isActive,
      curriculaCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  });
}

export async function updateDepartment(
  tenantId: string,
  userId: string,
  input: UpdateDepartmentInput
): Promise<DepartmentDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.department.findFirst({
      where: { id: input.id, tenantId },
      include: { _count: { select: { curricula: true } } },
    });
    if (!existing) {
      throw errors.not_found("Department not found");
    }

    const updated = await tx.department.update({
      where: { id: input.id, tenantId },
      data: {
        code: input.code,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        description: input.description || null,
        headName: input.headName || null,
        email: input.email || null,
        phone: input.phone || null,
        officeRoom: input.officeRoom || null,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "department.update",
        entity: "department",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      code: updated.code,
      nameTh: updated.nameTh,
      nameEn: updated.nameEn,
      description: updated.description,
      headName: updated.headName,
      email: updated.email,
      phone: updated.phone,
      officeRoom: updated.officeRoom,
      displayOrder: updated.displayOrder,
      isActive: updated.isActive,
      curriculaCount: existing._count.curricula,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function deleteDepartment(
  tenantId: string,
  userId: string,
  id: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.department.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { curricula: true } } },
    });
    if (!existing) {
      throw errors.not_found("Department not found");
    }

    if (existing._count.curricula > 0) {
      throw errors.conflict("Cannot delete department with assigned curricula");
    }

    await tx.department.delete({
      where: { id, tenantId },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "department.delete",
        entity: "department",
        entityId: id,
        before: existing,
      },
      tx
    );
  });
}

// ----------------------------------------------------
// Curriculum Services
// ----------------------------------------------------

export async function listCurricula(tenantId: string): Promise<CurriculumDto[]> {
  const items = await prisma.curriculum.findMany({
    where: { tenantId },
    include: {
      department: true,
    },
    orderBy: [{ degreeLevel: "asc" }, { code: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentCode: item.department?.code ?? null,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    degreeTh: item.degreeTh,
    degreeEn: item.degreeEn,
    degreeLevel: item.degreeLevel,
    totalCredits: item.totalCredits,
    tuitionFee: item.tuitionFee ? Number(item.tuitionFee) : null,
    brochurePdfUrl: item.brochurePdfUrl,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function listActiveCurricula(
  degreeLevel?: string,
  departmentId?: string
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = { status: { in: ["OPEN", "UPDATING"] } };
  if (degreeLevel && degreeLevel !== "ALL") {
    where.degreeLevel = degreeLevel as Prisma.EnumDegreeLevelFilter["equals"];
  }
  if (departmentId && departmentId !== "ALL") {
    where.departmentId = departmentId;
  }
  const items = await prisma.curriculum.findMany({
    where,
    include: {
      department: true,
    },
    orderBy: [{ degreeLevel: "asc" }, { code: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentCode: item.department?.code ?? null,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    degreeTh: item.degreeTh,
    degreeEn: item.degreeEn,
    degreeLevel: item.degreeLevel,
    totalCredits: item.totalCredits,
    tuitionFee: item.tuitionFee ? Number(item.tuitionFee) : null,
    brochurePdfUrl: item.brochurePdfUrl,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function createCurriculum(
  tenantId: string,
  input: CreateCurriculumInput
): Promise<CurriculumDto> {
  const created = await prisma.curriculum.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      degreeLevel: input.degreeLevel,
      totalCredits: input.totalCredits,
      tuitionFee: input.tuitionFee !== undefined ? input.tuitionFee : null,
      brochurePdfUrl: input.brochurePdfUrl || null,
      status: input.status,
    },
    include: {
      department: true,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    departmentId: created.departmentId,
    departmentCode: created.department?.code ?? null,
    departmentNameTh: created.department?.nameTh ?? null,
    departmentNameEn: created.department?.nameEn ?? null,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    degreeTh: created.degreeTh,
    degreeEn: created.degreeEn,
    degreeLevel: created.degreeLevel,
    totalCredits: created.totalCredits,
    tuitionFee: created.tuitionFee ? Number(created.tuitionFee) : null,
    brochurePdfUrl: created.brochurePdfUrl,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateCurriculum(
  tenantId: string,
  input: UpdateCurriculumInput
): Promise<CurriculumDto> {
  const updated = await prisma.curriculum.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId !== undefined ? input.departmentId : undefined,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      degreeLevel: input.degreeLevel,
      totalCredits: input.totalCredits,
      tuitionFee: input.tuitionFee !== undefined ? input.tuitionFee : null,
      brochurePdfUrl: input.brochurePdfUrl || null,
      status: input.status,
    },
    include: {
      department: true,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    departmentId: updated.departmentId,
    departmentCode: updated.department?.code ?? null,
    departmentNameTh: updated.department?.nameTh ?? null,
    departmentNameEn: updated.department?.nameEn ?? null,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    degreeTh: updated.degreeTh,
    degreeEn: updated.degreeEn,
    degreeLevel: updated.degreeLevel,
    totalCredits: updated.totalCredits,
    tuitionFee: updated.tuitionFee ? Number(updated.tuitionFee) : null,
    brochurePdfUrl: updated.brochurePdfUrl,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteCurriculum(tenantId: string, id: string): Promise<void> {
  await prisma.curriculum.delete({
    where: { id, tenantId },
  });
}
