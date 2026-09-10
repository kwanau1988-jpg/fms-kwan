import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateCurriculumInput, UpdateCurriculumInput } from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
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

export async function listCurricula(tenantId: string): Promise<CurriculumDto[]> {
  const items = await prisma.curriculum.findMany({
    where: { tenantId },
    orderBy: [{ degreeLevel: "asc" }, { code: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
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

import type { Prisma } from "@/generated/prisma";

export async function listActiveCurricula(degreeLevel?: string): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = { status: { in: ["OPEN", "UPDATING"] } };
  if (degreeLevel && degreeLevel !== "ALL") {
    where.degreeLevel = degreeLevel as Prisma.EnumDegreeLevelFilter["equals"];
  }
  const items = await prisma.curriculum.findMany({
    where,
    orderBy: [{ degreeLevel: "asc" }, { code: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
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

export async function createCurriculum(tenantId: string, input: CreateCurriculumInput): Promise<CurriculumDto> {
  const created = await prisma.curriculum.create({
    data: {
      tenantId,
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
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
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

export async function updateCurriculum(tenantId: string, input: UpdateCurriculumInput): Promise<CurriculumDto> {
  const updated = await prisma.curriculum.update({
    where: { id: input.id, tenantId },
    data: {
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
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
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
