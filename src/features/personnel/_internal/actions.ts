"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "../permissions";
import { createPersonnelProfileSchema, updatePersonnelProfileSchema } from "./validations";
import {
  createPersonnelProfile,
  updatePersonnelProfile,
  deletePersonnelProfile,
  listPersonnelProfiles,
  type PersonnelProfileDto,
} from "./services";

export async function getPersonnelProfilesAction(): Promise<ActionResult<PersonnelProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return listPersonnelProfiles(ctx.tenantId);
  });
}

export async function createPersonnelProfileAction(input: unknown): Promise<ActionResult<PersonnelProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = createPersonnelProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createPersonnelProfile(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/portal");
    revalidatePath("/portal/personnel");
    return result;
  });
}

export async function updatePersonnelProfileAction(input: unknown): Promise<ActionResult<PersonnelProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = updatePersonnelProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updatePersonnelProfile(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/portal");
    revalidatePath("/portal/personnel");
    return result;
  });
}

export async function deletePersonnelProfileAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    await deletePersonnelProfile(ctx.tenantId, id);
    revalidatePath("/personnel");
    revalidatePath("/portal");
    revalidatePath("/portal/personnel");
  });
}
