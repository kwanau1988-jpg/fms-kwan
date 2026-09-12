"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
} from "./validations";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  listCurricula,
  type CurriculumDto,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentDto,
} from "./services";

export async function getCurriculaAction(): Promise<ActionResult<CurriculumDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listCurricula(ctx.tenantId);
  });
}

export async function createCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteCurriculumAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculum(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
  });
}

// ----------------------------------------------------
// Department Server Actions
// ----------------------------------------------------

export async function getDepartmentsAction(includeInactive = false): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listDepartments(ctx.tenantId, includeInactive);
  });
}

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.departmentManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.departmentManage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.departmentManage);
    const parsed = deleteDepartmentSchema.parse({ id }, { error: zodErrorMap(await getLocale()) });
    await deleteDepartment(ctx.tenantId, ctx.userId, parsed.id);
    revalidatePath("/curriculum");
    revalidatePath("/portal");
    revalidatePath("/portal/curriculum");
  });
}
