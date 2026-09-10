import type { PermissionDef } from "@/shared/lib/permission-def";

export const ATTENDANCE_P = {
  attendanceScan: "attendance:scan",
  attendanceTeach: "attendance:teach",
  attendanceManage: "attendance:manage",
} as const;

export const ATTENDANCE_PERMISSIONS: readonly PermissionDef[] = [
  { code: ATTENDANCE_P.attendanceScan, module: "attendance", action: "scan" },
  { code: ATTENDANCE_P.attendanceTeach, module: "attendance", action: "teach" },
  { code: ATTENDANCE_P.attendanceManage, module: "attendance", action: "manage" },
];
