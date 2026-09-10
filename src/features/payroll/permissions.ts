import type { PermissionDef } from "@/shared/lib/permission-def";

export const PAYROLL_P = {
  payrollViewOwn: "payroll:view-own",
  payrollManage: "payroll:manage",
} as const;

export const PAYROLL_PERMISSIONS: readonly PermissionDef[] = [
  { code: PAYROLL_P.payrollViewOwn, module: "payroll", action: "view-own" },
  { code: PAYROLL_P.payrollManage, module: "payroll", action: "manage" },
];
