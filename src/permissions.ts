import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { PERSONNEL_PERMISSIONS } from "@/features/personnel/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { EDOCUMENT_PERMISSIONS } from "@/features/e-document/permissions";
import { BOOKING_PERMISSIONS } from "@/features/booking/permissions";
import { ATTENDANCE_PERMISSIONS } from "@/features/attendance/permissions";
import { PAYROLL_PERMISSIONS } from "@/features/payroll/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...PERSONNEL_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...EDOCUMENT_PERMISSIONS,
  ...BOOKING_PERMISSIONS,
  ...ATTENDANCE_PERMISSIONS,
  ...PAYROLL_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
