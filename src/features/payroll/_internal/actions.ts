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
} from "./validations";
import {
  listPeriods,
  createPeriod,
  togglePublishPeriod,
  generateDemoSlipsForPeriod,
  listMySlips,
  getMySlipDetail,
  type PayrollPeriodDto,
  type PayrollSlipDto,
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
