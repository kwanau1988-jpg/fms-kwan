"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { PAYROLL_P } from "../permissions";
import {
  createPeriodSchema,
  togglePublishPeriodSchema,
  generateDemoSlipsSchema,
  upsertPayrollSlipSchema,
  deletePayrollSlipSchema,
  setUserPasswordDirectSchema,
} from "./validations";
import {
  listPeriods,
  createPeriod,
  togglePublishPeriod,
  generateDemoSlipsForPeriod,
  listMySlips,
  getMySlipDetail,
  listPeriodSlips,
  listEligiblePersonnel,
  upsertPayrollSlip,
  deletePayrollSlip,
  setUserLoginPassword,
  type PayrollPeriodDto,
  type PayrollSlipDto,
  type EligiblePersonnelDto,
} from "./services";


export async function getMyPayrollSlipsAction(): Promise<ActionResult<PayrollSlipDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollViewOwn);
    return listMySlips(ctx.tenantId, ctx.userId);
  });
}

export async function getMySlipDetailAction(
  slipId: string,
): Promise<ActionResult<PayrollSlipDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollViewOwn);
    return getMySlipDetail(ctx.tenantId, ctx.userId, slipId);
  });
}

export async function getPayrollPeriodsAction(): Promise<ActionResult<PayrollPeriodDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    return listPeriods(ctx.tenantId);
  });
}

export async function createPayrollPeriodAction(
  input: unknown,
): Promise<ActionResult<PayrollPeriodDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = createPeriodSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createPeriod(ctx.tenantId, parsed);
    revalidatePath("/payroll");
    return result;
  });
}

export async function togglePublishPeriodAction(
  input: unknown,
): Promise<ActionResult<PayrollPeriodDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = togglePublishPeriodSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await togglePublishPeriod(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/payroll");
    revalidatePath("/me/payroll");
    return result;
  });
}

export async function generateDemoSlipsAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = generateDemoSlipsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const count = await generateDemoSlipsForPeriod(ctx.tenantId, parsed);
    revalidatePath("/payroll");
    revalidatePath("/me/payroll");
    return { count };
  });
}

export async function getPeriodSlipsAction(
  periodId: string,
): Promise<ActionResult<PayrollSlipDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    return listPeriodSlips(ctx.tenantId, periodId);
  });
}

export async function getEligiblePersonnelAction(): Promise<ActionResult<EligiblePersonnelDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    return listEligiblePersonnel(ctx.tenantId);
  });
}

export async function upsertPayrollSlipAction(
  input: unknown,
): Promise<ActionResult<PayrollSlipDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = upsertPayrollSlipSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await upsertPayrollSlip(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/payroll");
    revalidatePath("/me/payroll");
    return result;
  });
}

export async function deletePayrollSlipAction(
  slipId: string,
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = deletePayrollSlipSchema.parse({ slipId }, { error: zodErrorMap(await getLocale()) });
    await deletePayrollSlip(ctx.tenantId, parsed.slipId, ctx.userId);
    revalidatePath("/payroll");
    revalidatePath("/me/payroll");
  });
}

export async function setUserPayrollPasswordAction(
  input: unknown,
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PAYROLL_P.payrollManage);
    const parsed = setUserPasswordDirectSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await setUserLoginPassword(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/payroll");
  });
}

