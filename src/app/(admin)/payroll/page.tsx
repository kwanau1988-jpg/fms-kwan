import { requirePermission } from "@/features/identity/server";
import { PAYROLL_P, listPeriods } from "@/features/payroll/server";
import { PayrollAdminClient } from "./_components/payroll-admin-client";

export default async function PayrollAdminPage() {
  const ctx = await requirePermission(PAYROLL_P.payrollManage);
  const initialPeriods = await listPeriods(ctx.tenantId);

  return <PayrollAdminClient initialPeriods={initialPeriods} />;
}
