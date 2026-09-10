import { requirePermission } from "@/features/identity/server";
import { PAYROLL_P, listMySlips } from "@/features/payroll/server";
import { MyPayrollClient } from "./_components/my-payroll-client";

export default async function MyPayrollPage() {
  const ctx = await requirePermission(PAYROLL_P.payrollViewOwn);
  const initialSlips = await listMySlips(ctx.tenantId, ctx.userId);

  return <MyPayrollClient initialSlips={initialSlips} />;
}
